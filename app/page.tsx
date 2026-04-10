"use client";
import HeroSection from "@/app/hero/page";
import Footer from "./footer/page";
import Features from "./features/page";
import DemoPreview from "./demo/page";
import FAQSection from "./faq/page";
import CTAPage from "./cta/page";

const Page = () => {


  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <DemoPreview />
      <Features />
      <FAQSection />
      <CTAPage />
      <Footer />
    </div>
  );
};

export default Page;
