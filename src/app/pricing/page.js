'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Info, Loader } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [expandedNote, setExpandedNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState({
    usaToNigeria: {
      headers: ['Freight Type', 'Fashion Items', 'Computing', 'Drugs & Chemicals', 'Frozen Food', 'Machinery'],
      rows: [
        { type: 'Air Freight', rates: ['---', '---', '---', '---', '---'] },
        { type: 'Sea Freight', rates: ['---', '---', '---', '---', '---'] }
      ]
    },
    nigeriaToUSA: {
      headers: ['Freight Type', 'Fashion Items', 'Perishables', 'Farm Produce', 'Frozen Food', 'Machinery'],
      rows: [
        { type: 'Air Freight', rates: ['---', '---', '---', '---', '---'] },
        { type: 'Sea Freight', rates: ['---', '---', '---', '---', '---'] }
      ]
    }
  });

  // Fetch pricing data from API
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/pricing');
        const data = await res.json();
        if (data.success) {
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

  const PricingTable = ({ title, data }) => {
    if (!data || !data.headers) {
      return <div className="text-gray-600">Loading pricing data...</div>;
    }

    const formatPrice = (rate) => {
      // If rate is empty or '---', return it as is
      if (!rate || rate === '---') return rate;
      
      // Try to convert to number
      const numRate = parseFloat(rate);
      if (isNaN(numRate)) return rate;
      
      // Format as currency with naira symbol
      return `₦${numRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
    <div className="mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{title}</h2>
      
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-red-600 to-red-700">
              {data.headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-4 text-left text-xs sm:text-sm font-semibold text-white border-b border-red-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`${
                  rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-blue-50 transition-colors`}
              >
                <td className="px-4 py-4 font-semibold text-gray-900 text-sm sm:text-base border-b border-gray-200">
                  {row.type}
                </td>
                {row.rates.map((rate, idx) => (
                  <td
                    key={idx}
                    className="px-4 py-4 text-gray-700 text-sm sm:text-base border-b border-gray-200 text-center font-semibold"
                  >
                    {formatPrice(rate)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {data.rows.map((row, rowIdx) => (
          <div key={rowIdx} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-600">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="font-bold text-gray-900 text-base">{row.type}</p>
            </div>
            <div className="space-y-3">
              {data.headers.slice(1).map((header, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">{header}</span>
                  <span className="font-semibold text-gray-900 text-sm bg-gray-100 px-3 py-1 rounded">
                    {formatPrice(row.rates[idx])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shipping Rates
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
            Get competitive rates for shipping between USA and Nigeria. Our rates vary based on cargo type and freight method.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : (
          <>
            {/* Rate Card Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-600">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 rounded-full p-2 mt-1">
                    <Info className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Rates Per Kilogram</h3>
                    <p className="text-sm text-gray-600">All rates shown are per kilogram and include basic handling fees.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-amber-600">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 rounded-full p-2 mt-1">
                    <Info className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Bulk Discounts</h3>
                    <p className="text-sm text-gray-600">Special rates available for large shipments. Contact our team for details.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Tables */}
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 mb-12">
              <PricingTable title="USA To Nigeria Shipping Rates" data={pricingData.usaToNigeria} />
              <div className="border-t-2 border-gray-200 my-12" />
              <PricingTable title="Nigeria To USA Shipping Rates" data={pricingData.nigeriaToUSA} />
            </div>

            {/* Important Note Section */}
            <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6 mb-12">
              <button
                onClick={() => setExpandedNote(!expandedNote)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <h3 className="font-bold text-gray-900 text-left">Important Note About Our Rates</h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-red-600 transition-transform ${
                    expandedNote ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {expandedNote && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                    The rates displayed above are <span className="font-semibold">estimates only</span> and may vary depending on:
                  </p>
                  <ul className="text-sm sm:text-base text-gray-700 space-y-2 mb-4 ml-4">
                    <li>• Shipment quantity and weight</li>
                    <li>• Current market conditions</li>
                    <li>• Seasonal variations</li>
                    <li>• Cargo packaging requirements</li>
                    <li>• Special handling needs</li>
                  </ul>
                  <p className="text-sm sm:text-base text-gray-700 mb-4">
                    For an accurate quote tailored to your specific shipment, please{' '}
                    <Link href="/request-a-quote" className="text-red-600 font-semibold hover:text-red-700">
                      request a quote
                    </Link>
                    {' '}or contact our team.
                  </p>
                </div>
              )}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-8 sm:p-10 text-white text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Need a Custom Quote?</h2>
              <p className="text-red-100 mb-6 text-base sm:text-lg">
                Get personalized shipping rates based on your specific requirements
              </p>
              <Link
                href="/request-a-quote"
                className="inline-block bg-white text-red-600 font-semibold py-3 px-8 rounded-lg hover:bg-red-50 transition-colors"
              >
                Request a Quote
              </Link>
            </div>

            {/* FAQ Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Air Freight</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Fast and reliable air freight service ideal for time-sensitive shipments. Typically delivered within 3-5 business days.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Sea Freight</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Cost-effective sea freight for larger shipments. Delivery typically takes 2-3 weeks depending on port availability.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
