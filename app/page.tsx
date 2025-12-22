"use client";
import HeroSection from "@/app/home/page";
import Footer from "./footer/page";
import Features from "./features/page";
import DemoPreview from "./demo/page";

const Page = () => {


  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <DemoPreview />
      <Features />
      <Footer />
    </div>
  );
};

export default Page;
