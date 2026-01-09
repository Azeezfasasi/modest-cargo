'use client'

import React, { useState, useEffect } from 'react'

export default function MessageSlides() {
  const [isPaused, setIsPaused] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [animationDuration, setAnimationDuration] = useState('15s')

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/message-slides')
        const data = await response.json()
        if (data.success && data.data.length > 0) {
          setMessages(data.data.map((msg) => msg.message))
        } else {
          // Fallback messages if no data from API
          setMessages([
            '🚚 Fast & Reliable Shipping Solutions Across Nigeria',
            '💰 Get Competitive Quotes for Your Cargo Today',
            '✅ Track Your Shipments in Real-Time',
            '🌍 Trusted by Thousands of Businesses Nationwide',
            '📞 24/7 Customer Support Always Ready to Help',
          ])
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        // Use fallback messages on error
        setMessages([
          '🚚 Fast & Reliable Shipping Solutions Across Nigeria',
          '💰 Get Competitive Quotes for Your Cargo Today',
          '✅ Track Your Shipments in Real-Time',
          '🌍 Trusted by Thousands of Businesses Nationwide',
          '📞 24/7 Customer Support Always Ready to Help',
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Set animation duration based on screen size
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setAnimationDuration('10s') // Mobile: fastest
      } else if (window.innerWidth < 768) {
        setAnimationDuration('12s') // Tablet: medium
      } else {
        setAnimationDuration('15s') // Desktop: slower
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const scrollStyle = {
    animation: isPaused ? 'none' : `scroll ${animationDuration} linear infinite`,
    display: 'flex',
  }

  if (loading || messages.length === 0) {
    return null
  }

  return (
    <>
      <div className="w-full bg-gradient-to-r from-amber-600 via-red-400 to-amber-800 text-white py-3 overflow-hidden">
        <div className="w-full overflow-hidden">
          <div
            style={scrollStyle}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="hover:cursor-pointer"
          >
            {messages.map((message, index) => (
              <span key={index} className="inline-flex items-center px-12 py-0 text-base font-medium tracking-wide whitespace-nowrap flex-shrink-0">
                {message}
              </span>
            ))}
            {/* Duplicate for seamless looping */}
            {messages.map((message, index) => (
              <span key={`duplicate-${index}`} className="inline-flex items-center px-12 py-0 text-base font-medium tracking-wide whitespace-nowrap flex-shrink-0">
                {message}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 768px) {
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        }
      `}</style>
    </>
  )
}
