'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader } from 'lucide-react';
import axios from 'axios';

export default function ShipmentChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [activeChart, setActiveChart] = useState('pie');

  // Sample data structure - replace with API call
  const defaultData = {
    byStatus: [
      { name: 'Pending', value: 24 },
      { name: 'In Transit', value: 42 },
      { name: 'Delivered', value: 156 },
      { name: 'Cancelled', value: 8 }
    ],
    byMonth: [
      { month: 'Jan', quotes: 45, delivered: 38 },
      { month: 'Feb', quotes: 52, delivered: 48 },
      { month: 'Mar', quotes: 38, delivered: 35 },
      { month: 'Apr', quotes: 61, delivered: 58 },
      { month: 'May', quotes: 55, delivered: 52 },
      { month: 'Jun', quotes: 67, delivered: 64 }
    ]
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from actual API endpoint
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/dashboard/shipment-chart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success && response.data.data) {
          setChartData(response.data.data);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data. Showing default data.');
        setChartData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];
  const barColors = { quotes: '#3B82F6', delivered: '#10B981' };

  // Custom label renderer for pie chart
  const renderPieLabel = (entry) => {
    const total = chartData?.byStatus?.reduce((sum, item) => sum + item.value, 0) || 0;
    const percent = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
    return `${entry.name}: ${entry.value}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-red-600" />
          <p className="text-gray-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error && !chartData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Quote & Shipment Analytics</h2>
        
        {/* Chart Toggle Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setActiveChart('pie')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              activeChart === 'pie'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Status Distribution
          </button>
          <button
            onClick={() => setActiveChart('bar')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              activeChart === 'bar'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly Trend
          </button>
        </div>
      </div>

      {/* Charts Container */}
      <div className="w-full">
        {/* Pie Chart - Quote Status Distribution */}
        {activeChart === 'pie' && chartData?.byStatus && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full flex justify-center" style={{ height: '450px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={chartData.byStatus}
                    cx="50%"
                    cy="45%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => {
                      const total = chartData?.byStatus?.reduce((sum, item) => sum + item.value, 0) || 0;
                      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                      return [`${value} quotes (${percent}%)`, 'Count'];
                    }}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '14px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Stats Grid below Pie Chart */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
              {chartData?.byStatus && chartData.byStatus.map((item, idx) => {
                const total = chartData.byStatus.reduce((sum, i) => sum + i.value, 0);
                const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                return (
                  <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div
                      className="inline-block w-4 h-4 rounded-full mb-2"
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    ></div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">{item.name}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-500">{percent}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bar Chart - Monthly Trend */}
        {activeChart === 'bar' && chartData?.byMonth && (
          <div className="min-h-96 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData.byMonth}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Bar 
                  dataKey="quotes" 
                  fill={barColors.quotes}
                  radius={[8, 8, 0, 0]}
                  name="Total Quotes"
                />
                <Bar 
                  dataKey="delivered" 
                  fill={barColors.delivered}
                  radius={[8, 8, 0, 0]}
                  name="Delivered"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
