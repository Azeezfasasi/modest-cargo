import React from 'react'
import Hero from '@/components/home-component/Hero'
import OurServices from '@/components/home-component/OurServices'
import HomeAbout from '@/components/home-component/HomeAbout'
import FeaturedProjects from '@/components/home-component/FeaturedProjects'
import TestimonialsSection from '@/components/home-component/TestimonialsSection'
import CallToAction from '@/components/home-component/CallToAction'
import RequestQuote from '@/components/home-component/RequestQuote'
import ClientsLogoSlider from '@/components/home-component/ClientsLogoSlider'
import SubscribeToNewsletter from '@/components/home-component/SubscribeToNewsletter'
import WhyChooseUs from '@/components/home-component/WhyChooseUs'
import SubscribeModal from '@/components/home-component/SubscribeModal'

export default function HomePage() {
  return (
    <>
      <SubscribeModal />
      <Hero />
      <HomeAbout />
      <OurServices />
      <ClientsLogoSlider />
      <TestimonialsSection />
      <WhyChooseUs />
      <RequestQuote />
      <SubscribeToNewsletter />
    </>
  )
}
