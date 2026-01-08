'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Save, Loader, ChevronDown } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';

const PricingTableEditor = ({ title, direction, data, onUpdateRate, onUpdateFreightType, onAddRow, onDeleteRow, onAddHeader, onUpdateHeader, onDeleteHeader }) => {
  const [showCategories, setShowCategories] = useState(false);

  return (
  <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
      <button
        onClick={() => onAddRow(direction)}
        className="flex items-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start"
      >
        <Plus className="w-4 h-4" />
        Add Row
      </button>
    </div>

    {/* Categories Section - Collapsible on Mobile */}
    <div className="mb-6 sm:mb-8">
      <button
        onClick={() => setShowCategories(!showCategories)}
        className="w-full sm:w-auto flex items-center gap-2 mb-4 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors sm:bg-transparent sm:px-0 sm:py-0 sm:hover:bg-transparent"
      >
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex-grow sm:flex-grow-0">Categories</h3>
        <ChevronDown className={`w-4 h-4 sm:hidden transition-transform ${showCategories ? 'rotate-180' : ''}`} />
      </button>

      {/* Categories list - visible always on desktop, collapsed on mobile */}
      <div className={`${showCategories ? 'block' : 'hidden'} sm:block space-y-2 sm:space-y-2 mb-4`}>
        {data.headers.map((header, idx) => (
          <div key={`header-${direction}-${idx}`} className="flex items-center gap-2">
            <input
              type="text"
              value={header}
              onChange={(e) => onUpdateHeader(direction, idx, e.target.value)}
              disabled={idx === 0}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none disabled:bg-gray-100 cursor-text text-sm"
            />
            {idx > 0 && (
              <button
                onClick={() => onDeleteHeader(direction, idx)}
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => onAddHeader(direction)}
        className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm w-full sm:w-auto justify-center"
      >
        <Plus className="w-4 h-4" />
        Add Category
      </button>
    </div>

    {/* Rates Table - Responsive Layout */}
    <div className="overflow-x-auto border border-gray-300 rounded-lg">
      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {data.headers.map((header, idx) => (
                <th
                  key={`th-${direction}-${idx}`}
                  className="px-4 py-3 text-left font-semibold text-gray-900 text-sm border-r border-gray-300 last:border-r-0"
                >
                  {header}
                </th>
              ))}
              <th className="px-4 py-3 text-center font-semibold text-gray-900 text-sm bg-gray-100">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIdx) => (
              <tr key={`row-${direction}-${rowIdx}`} className="border-t border-gray-300 hover:bg-red-50">
                <td className="px-4 py-3 border-r border-gray-300">
                  <input
                    type="text"
                    value={row.type}
                    onChange={(e) => onUpdateFreightType(direction, rowIdx, e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none text-sm cursor-text"
                  />
                </td>
                {row.rates.map((rate, rateIdx) => (
                  <td key={`rate-${direction}-${rowIdx}-${rateIdx}`} className="px-4 py-3 border-r border-gray-300 last:border-r-0">
                    <input
                      type="text"
                      value={rate}
                      onChange={(e) => onUpdateRate(direction, rowIdx, rateIdx, e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none text-sm text-center font-medium cursor-text"
                      placeholder="0"
                      inputMode="numeric"
                    />
                  </td>
                ))}
                <td className="px-4 py-3 text-center bg-gray-50">
                  <button
                    onClick={() => onDeleteRow(direction, rowIdx)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors inline-block"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden p-4 space-y-4">
        {data.rows.map((row, rowIdx) => (
          <div key={`card-${direction}-${rowIdx}`} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            {/* Freight Type */}
            <div className="mb-4 pb-4 border-b border-gray-300">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Freight Type</label>
              <input
                type="text"
                value={row.type}
                onChange={(e) => onUpdateFreightType(direction, rowIdx, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none text-sm"
              />
            </div>

            {/* Rates */}
            <div className="space-y-3 mb-4">
              {row.rates.map((rate, rateIdx) => (
                <div key={`rate-${rowIdx}-${rateIdx}`}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {data.headers[rateIdx + 1]}
                  </label>
                  <input
                    type="text"
                    value={rate}
                    onChange={(e) => onUpdateRate(direction, rowIdx, rateIdx, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none text-sm"
                    placeholder="0"
                    inputMode="numeric"
                  />
                </div>
              ))}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => onDeleteRow(direction, rowIdx)}
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <X className="w-4 h-4" />
              Delete Row
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default function ManagePricing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricingData, setPricingData] = useState({
    usaToNigeria: {
      headers: ['Freight Type', 'Fashion Items', 'Computing', 'Drugs & Chemicals', 'Frozen Food', 'Machinery'],
      rows: [
        { type: 'Air Freight', rates: ['', '', '', '', ''] },
        { type: 'Sea Freight', rates: ['', '', '', '', ''] }
      ]
    },
    nigeriaToUSA: {
      headers: ['Freight Type', 'Fashion Items', 'Perishables', 'Farm Produce', 'Frozen Food', 'Machinery'],
      rows: [
        { type: 'Air Freight', rates: ['', '', '', '', ''] },
        { type: 'Sea Freight', rates: ['', '', '', '', ''] }
      ]
    }
  });

  // Fetch pricing data on mount
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/pricing');
        const data = await res.json();
        if (data.success && data.data) {
          setPricingData(data.data);
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const savePricing = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Pricing saved successfully!');
      } else {
        toast.error(data.message || 'Failed to save pricing');
      }
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast.error('Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  const updateRate = (direction, rowIdx, rateIdx, value) => {
    setPricingData(prev => {
      const key = direction === 'usa' ? 'usaToNigeria' : 'nigeriaToUSA';
      const newData = { ...prev };
      newData[key] = {
        ...newData[key],
        rows: newData[key].rows.map((row, idx) =>
          idx === rowIdx
            ? { ...row, rates: row.rates.map((r, i) => i === rateIdx ? value : r) }
            : row
        )
      };
      return newData;
    });
  };

  const updateFreightType = (direction, rowIdx, value) => {
    setPricingData(prev => {
      const key = direction === 'usa' ? 'usaToNigeria' : 'nigeriaToUSA';
      const newData = { ...prev };
      newData[key] = {
        ...newData[key],
        rows: newData[key].rows.map((row, idx) =>
          idx === rowIdx ? { ...row, type: value } : row
        )
      };
      return newData;
    });
  };

  const addRow = (direction) => {
    setPricingData(prev => {
      const key = direction === 'usa' ? 'usaToNigeria' : 'nigeriaToUSA';
      const numRates = prev[key].headers.length - 1;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          rows: [
            ...prev[key].rows,
            { type: 'New Freight Type', rates: Array(numRates).fill('') }
          ]
        }
      };
    });
  };

  const deleteRow = (direction, rowIdx) => {
    setPricingData(prev => {
      const key = direction === 'usa' ? 'usaToNigeria' : 'nigeriaToUSA';
      return {
        ...prev,
        [key]: {
          ...prev[key],
          rows: prev[key].rows.filter((_, i) => i !== rowIdx)
        }
      };
    });
  };

  const addHeader = (direction) => {
    setPricingData(prev => {
      const key = direction === 'usa' ? 'usaToNigeria' : 'nigeriaToUSA';
      return {
        ...prev,
        [key]: {
          ...prev[key],
          headers: [...prev[key].headers, 'New Category'],
          rows: prev[key].rows.map(row => ({
            ...row,
            rates: [...row.rates, '']
          }))
        }
      };
    });
  };

  const updateHeader = (direction, idx, value) => {
    setPricingData(prev => {
      const key = direction === 'usa' ? 'usaToNigeria' : 'nigeriaToUSA';
      return {
        ...prev,
        [key]: {
          ...prev[key],
          headers: prev[key].headers.map((h, i) => i === idx ? value : h)
        }
      };
    });
  };

  const deleteHeader = (direction, idx) => {
    if (idx === 0) {
      toast.error('Cannot delete Freight Type column');
      return;
    }
    setPricingData(prev => {
      const key = direction === 'usa' ? 'usaToNigeria' : 'nigeriaToUSA';
      return {
        ...prev,
        [key]: {
          ...prev[key],
          headers: prev[key].headers.filter((_, i) => i !== idx),
          rows: prev[key].rows.map(row => ({
            ...row,
            rates: row.rates.filter((_, i) => i !== idx - 1)
          }))
        }
      };
    });
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Manage Pricing</h1>
            <p className="text-xs sm:text-base text-gray-600">Edit shipping rates for different cargo types and freight methods</p>
          </div>

          {/* Pricing Tables */}
          <PricingTableEditor
            title="USA To Nigeria Shipping Rates"
            direction="usa"
            data={pricingData.usaToNigeria}
            onUpdateRate={updateRate}
            onUpdateFreightType={updateFreightType}
            onAddRow={addRow}
            onDeleteRow={deleteRow}
            onAddHeader={addHeader}
            onUpdateHeader={updateHeader}
            onDeleteHeader={deleteHeader}
          />

          <PricingTableEditor
            title="Nigeria To USA Shipping Rates"
            direction="nigeria"
            data={pricingData.nigeriaToUSA}
            onUpdateRate={updateRate}
            onUpdateFreightType={updateFreightType}
            onAddRow={addRow}
            onDeleteRow={deleteRow}
            onAddHeader={addHeader}
            onUpdateHeader={updateHeader}
            onDeleteHeader={deleteHeader}
          />

          {/* Save Button */}
          <div className="sticky bottom-4 sm:bottom-8 flex gap-3 sm:gap-4">
            <button
              onClick={savePricing}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold cursor-pointer text-sm sm:text-base flex-1 sm:flex-none"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Save All Changes</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

