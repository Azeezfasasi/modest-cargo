import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Package, Mail, X, ChevronRight } from 'lucide-react';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    totalNotifications: 0,
    pendingQuotes: { count: 0, data: [] },
    pendingContacts: { count: 0, data: [] },
  });
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (data.success) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications on component mount and set up background refresh
  useEffect(() => {
    // Fetch immediately on mount
    fetchNotifications();

    // Set up background refresh every 60 seconds
    const backgroundInterval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(backgroundInterval);
  }, []);

  // Fetch notifications when panel opens and set up faster refresh
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      // Refresh every 30 seconds while panel is open for real-time updates
      const panelInterval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(panelInterval);
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const hasNotifications = notifications.totalNotifications > 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 transition-colors z-40"
      >
        <Bell className="w-5 h-5" />

        {/* Notification Badge */}
        {hasNotifications && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full min-w-[20px] shadow-lg">
            {notifications.totalNotifications > 99 ? '99+' : notifications.totalNotifications}
          </span>
        )}
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/0 sm:bg-transparent z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed sm:absolute right-0 sm:right-0 left-0 sm:left-auto bottom-0 sm:bottom-auto top-auto sm:top-full mt-0 sm:mt-2 mx-0 sm:mx-0 w-full sm:w-96 bg-white border border-gray-200 rounded-t-2xl sm:rounded-lg shadow-xl z-50 max-h-[75vh] sm:max-h-[600px] overflow-hidden flex flex-col animate-fade-in md:w-80">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h3 className="font-semibold text-sm sm:text-base">Notifications</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-red-500 rounded-md transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : notifications.totalNotifications === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm text-center">No notifications at the moment</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Pending Quotes Section */}
                {notifications.pendingQuotes.count > 0 && (
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900">
                        Pending Quotes
                        <span className="ml-2 inline-block px-2 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full">
                          {notifications.pendingQuotes.count}
                        </span>
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {notifications.pendingQuotes.data.map((quote, idx) => (
                        <Link
                          key={idx}
                          href={`/dashboard/quote-requests`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {quote.fullName}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {quote.trackingNumber}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(quote.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Contact Responses Section */}
                {notifications.pendingContacts.count > 0 && (
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Mail className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900">
                        Contact Messages
                        <span className="ml-2 inline-block px-2 py-0.5 text-xs font-bold text-white bg-green-600 rounded-full">
                          {notifications.pendingContacts.count}
                        </span>
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {notifications.pendingContacts.data.map((contact, idx) => (
                        <Link
                          key={idx}
                          href={`/dashboard/contact-form-responses`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {contact.name}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {contact.subject}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(contact.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.totalNotifications > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 sticky bottom-0">
              <div className="flex gap-2">
                <Link
                  href="/dashboard/quote-requests"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  View Quotes
                </Link>
                <Link
                  href="/dashboard/contact-form-responses"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-center text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                >
                  View Messages
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
