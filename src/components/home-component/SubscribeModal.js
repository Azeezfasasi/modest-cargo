'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader, X } from 'lucide-react';

const MODAL_STORAGE_KEY = 'hasSeenNewsletterModal';
const MODAL_EXPIRY_DAYS = 30; // Show again after 30 days

export default function SubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user has seen the modal
    const checkAndShowModal = () => {
      const stored = localStorage.getItem(MODAL_STORAGE_KEY);
      
      if (!stored) {
        // Show modal after 2 seconds for better UX
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        // Check if stored data has expired
        const storedData = JSON.parse(stored);
        const storedDate = new Date(storedData.date);
        const currentDate = new Date();
        const daysPassed = (currentDate - storedDate) / (1000 * 60 * 60 * 24);
        
        if (daysPassed > MODAL_EXPIRY_DAYS) {
          // Reset and show again
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 2000);
          return () => clearTimeout(timer);
        }
      }
    };

    checkAndShowModal();
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Save to localStorage that user has seen the modal
    localStorage.setItem(MODAL_STORAGE_KEY, JSON.stringify({
      date: new Date().toISOString(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter?action=subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim() || 'Subscriber',
          lastName: lastName.trim() || '',
        }),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        setStatus('success');
        setMessage('Successfully subscribed! Check your email for confirmation.');
        setEmail('');
        setFirstName('');
        setLastName('');
        
        // Close modal after success
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Connection error. Please try again later.');
      console.error('Subscribe error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>

          {/* Modal Content */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-red-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Stay Connected</h2>
              </div>
              <p className="text-gray-600">
                Get exclusive updates, special offers, and industry insights delivered to your inbox.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-red-700 font-bold">✓</span>
                <span className="text-sm text-gray-700">Latest shipping updates & industry news</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-red-700 font-bold">✓</span>
                <span className="text-sm text-gray-700">Exclusive deals and promotions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-red-700 font-bold">✓</span>
                <span className="text-sm text-gray-700">Unsubscribe anytime - no spam!</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name */}
              <div>
                <label htmlFor="modalFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name (Optional)
                </label>
                <input
                  type="text"
                  id="modalFirstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500 text-sm"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="modalLastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name (Optional)
                </label>
                <input
                  type="text"
                  id="modalLastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500 text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="modalEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="modalEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500 text-sm"
                />
              </div>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-green-800">{message}</p>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-800">{message}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || status === 'success'}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-900 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>Subscribe Now</span>
                  </>
                )}
              </button>
            </form>

            {/* Close CTA */}
            <button
              onClick={handleClose}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Not interested right now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
