'use client'

import React, { useState, useEffect } from 'react'

export default function MessageSlides() {
  const [isPaused, setIsPaused] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
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
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)
      
      if (isMobileView) {
        setAnimationDuration('4s') // Mobile: 4s per message
      } else if (window.innerWidth < 1024) {
        setAnimationDuration('15s') // Tablet: ticker
      } else {
        setAnimationDuration('18s') // Desktop: ticker
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-rotate messages on mobile
  useEffect(() => {
    if (!isMobile || messages.length === 0 || isPaused || loading) return

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
    }, 4000) // Change message every 4 seconds

    return () => clearInterval(interval)
  }, [isMobile, messages.length, isPaused, loading])

  const scrollStyle = {
    animation: isPaused ? 'none' : `scroll ${animationDuration} linear infinite`,
    display: 'flex',
  }

  if (loading || messages.length === 0) {
    return null
  }

  // Mobile: Carousel/Rotator view
  if (isMobile) {
    return (
      <div className="w-full bg-gradient-to-r from-amber-600 via-red-400 to-amber-800 text-white py-2 px-4">
        <div 
          className="text-center transition-opacity duration-500 ease-in-out min-h-[3rem] flex items-center justify-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <p className="text-sm font-medium tracking-wide line-clamp-2">
            {messages[currentMessageIndex]}
          </p>
        </div>
        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-3">
          {messages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentMessageIndex(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentMessageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
              }`}
              aria-label={`Go to message ${index + 1}`}
            />
          ))}
        </div>
      </div>
    )
  }

  // Desktop/Tablet: Ticker view
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
              <span key={index} className="inline-flex items-center px-6 md:px-12 py-0 text-sm md:text-base font-medium tracking-wide whitespace-nowrap flex-shrink-0">
                {message}
              </span>
            ))}
            {/* Duplicate for seamless looping */}
            {messages.map((message, index) => (
              <span key={`duplicate-${index}`} className="inline-flex items-center px-6 md:px-12 py-0 text-sm md:text-base font-medium tracking-wide whitespace-nowrap flex-shrink-0">
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
      `}</style>
    </>
  )
}
