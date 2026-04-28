"use client";

import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ClinicalConcierge from '@/components/ClinicalConcierge'
import Overview from '@/components/Overview'
import Science from '@/components/Science'
import Protocol from '@/components/Protocol'
import Products from '@/components/Products'
import Reviews from '@/components/Reviews'
import Packages from '@/components/Packages'
import Consult from '@/components/Consult'
import Footer from '@/components/Footer'
import VideoModal from '@/components/VideoModal'

export default function Home() {
  return (
    <>
      <VideoModal />
      <Header />
      <ClinicalConcierge />
      <Hero />
      <main className="space-y-24 md:space-y-32 pb-24">
        <Overview />
        <Science />
        <Protocol />
        <Products />
        <Reviews />
        <Packages />
        <Consult />
      </main>
      <Footer />
    </>
  )
}
