"use client"
import React from 'react'
import Image from 'next/image'

export default function Careers() {
  const benefits = [
    {
  title: 'Career Growth & Development',
  description: 'Continuous learning opportunities, professional training, and hands-on exposure to real-world logistics, freight, and supply chain operations.',
  icon: '📈'
  },
  {
    title: 'Team-Driven Work Environment',
    description: 'We promote collaboration, mutual respect, and clear communication to ensure efficient operations and a supportive workplace.',
    icon: '🤝'
  },
  {
    title: 'Leadership & Responsibility',
    description: 'We empower our team members to take ownership, lead logistics operations, and contribute to process improvement and innovation.',
    icon: '🎯'
  },
  {
    title: 'Competitive Rewards & Benefits',
    description: 'Fair compensation, staff welfare programs, performance recognition, and support for professional development.',
    icon: '💼'
  }
]

  const disciplines = [
    'Logistics Coordination',
    'Supply Chain Management',
    'Freight Forwarding',
    'Customs Brokerage',
    'Warehouse Management',
    'Transportation Planning',
  ]

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-700 to-red-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Careers at Modest Cargo</h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-3xl mx-auto">
            Join a dynamic, innovation-driven company where your talent and passion can make a real impact across global logistics and supply chain solutions.
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/images/projectplaceholder.png"
                  alt="Careers at Modest Cargo"
                  fill
                  sizes="100%"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Greatest Asset Is Our People
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  At Modest Cargo, we believe that our greatest asset is our people. We are always on the lookout for talented, motivated, and passionate individuals to join our team. Whether you are an experienced professional or a fresh graduate, we offer a range of exciting career opportunities across various disciplines.
                </p>
                <p>
                  We provide an enabling environment where professionals can grow, contribute meaningfully, and excel in their chosen careers. Our culture values integrity, excellence, creativity, teamwork, and a relentless commitment to delivering outstanding results across all our project engagements.
                </p>
                <p className="text-red-700 font-semibold">
                  At Modest Cargo, your career is not just a job — it&apos;s a partnership for growth, innovation, and excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">What We Offer</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 text-center">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Look For Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Who We Look For</h2>
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-md p-8 md:p-12 border-l-4 border-red-700">
              <p className="text-lg text-gray-700 leading-relaxed">
                We seek individuals who are passionate about logistics, supply chain management, and making a tangible impact in a fast-paced industry. Ideal candidates are proactive, collaborative, and committed to excellence. Whether you&apos;re an experienced professional or just starting your career, if you&apos;re eager to learn, grow, and contribute to a dynamic team, we want to hear from you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">We Are Hiring</h2>

          <div className="max-w-4xl mx-auto">
            <p className="text-center text-gray-700 text-lg mb-8">
              We are constantly expanding our team across various disciplines:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {disciplines.map((discipline, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">{discipline}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 md:p-12 border-t-4 border-red-700">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Apply Now</h3>
              <p className="text-gray-700 mb-6">
                Interested applicants may submit their CV and cover letter to:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <span className="text-lg font-semibold text-red-700">info@modestcargo.com</span>
                <a
                  href="mailto:info@modestcargo.com"
                  className="inline-flex items-center gap-2 bg-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition"
                >
                  Send Application
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-red-700 to-red-900">
        <div className="container mx-auto px-6 lg:px-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Be part of a team where your contributions matter, your growth is supported, and excellence is celebrated.
          </p>
          <a
            href="mailto:info@modestcargo.com"
            className="inline-block bg-white text-red-700 px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-50 transition"
          >
            Submit Your Application
          </a>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Our Culture & Values</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {['Integrity', 'Excellence', 'Creativity', 'Teamwork', 'Results'].map((value, idx) => (
              <div key={idx} className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 text-center border-l-4 border-red-700">
                <h3 className="text-lg font-bold text-gray-900">{value}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {value === 'Integrity' && 'Acting with honesty and strong principles'}
                  {value === 'Excellence' && 'Delivering outstanding results always'}
                  {value === 'Creativity' && 'Innovating and thinking differently'}
                  {value === 'Teamwork' && 'Collaborating for greater impact'}
                  {value === 'Results' && 'Committed to exceptional outcomes'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
