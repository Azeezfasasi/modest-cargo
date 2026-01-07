import React from 'react'
import { Zap, DollarSign, MapPin, Users } from 'lucide-react'

// Icon component for each benefit
function BenefitIcon({ type }) {
  const iconProps = { className: 'w-12 h-12', strokeWidth: 1.5 }

  switch (type) {
    case 'speed':
      return <Zap {...iconProps} className="w-12 h-12 text-red-600" />
    case 'cost':
      return <DollarSign {...iconProps} className="w-12 h-12 text-red-600" />
    case 'tracking':
      return <MapPin {...iconProps} className="w-12 h-12 text-red-600" />
    case 'support':
      return <Users {...iconProps} className="w-12 h-12 text-red-600" />
    default:
      return null
  }
}

export default function WhyChooseUs() {
  const benefits = [
    {
      id: 1,
      number: '01',
      title: 'Faster Shipping Time',
      description: 'Unlike other shippers who will leave your wares in their warehouse for months, we deliver strictly according to the scheduled time.',
      icon: 'speed',
    },
    {
      id: 2,
      number: '02',
      title: 'Reduced Shipping Cost',
      description: 'We consolidate your items and are in partnership with DHL, Fedex and UPS to offer you reduced shipping costs that saves you over 65%.',
      icon: 'cost',
    },
    {
      id: 3,
      number: '03',
      title: 'Real Time Tracking',
      description: 'We offer you resources to track your shipped items and know their actual location and movements all-through the shipping life-cycle.',
      icon: 'tracking',
    },
    {
      id: 4,
      number: '04',
      title: 'Great Customer Support',
      description: 'We prioritize our customers and we pride ourselves in our customer-centric approach to business. Our customer support system is top-notch.',
      icon: 'support',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-4">
            <span className="text-red-600 font-bold text-sm md:text-base tracking-wider">
              &lt; WHY US? &gt;
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            Why Choose Modest Cargo?
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="bg-gray-50 rounded-lg p-6 md:p-8 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex gap-6 md:gap-8">
                {/* Icon Container */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white border-2 border-gray-200">
                    <BenefitIcon type={benefit.icon} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  {/* Number */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl md:text-2xl font-bold text-red-600">
                      {benefit.number}
                    </span>
                    <div className="h-1 w-8 bg-red-600"></div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 pb-2 border-b-2 border-red-600 inline-block">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
