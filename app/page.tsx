"use client";
import HeroSection from '@/app/components/home/page';
import Footer from './components/footer/page';
import Features from './components/features/page';
import DemoPreview from './components/demo/page';

const page = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection/>
     <DemoPreview/>
      <Features/>
      <Footer/>
    </div>
  )
}

export default page
