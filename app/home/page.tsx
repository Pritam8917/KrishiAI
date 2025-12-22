"use client";
import { Button } from "@/app/components/ui/button";
import { ArrowRight, Leaf, BarChart3, Satellite, Sparkles } from "lucide-react";
import Header from "@/app/navbar/page";

export default  function HeroSection() {

  const features = [
    { icon: Leaf, label: "Soil Analysis", color: "bg-amber-700" },
    { icon: BarChart3, label: "Yield Prediction", color: "bg-emerald-700" },
    { icon: Satellite, label: "Satellite Monitoring", color: "bg-sky-600" },
    { icon: Sparkles, label: "AI Recommendations", color: "bg-amber-500" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Header/>
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/assets/hero-farm.jpg')] " />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-950/80 via-emerald-900/70 to-amber-900/60" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8 animate-grow">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">
              AI-Powered Agriculture Intelligence
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className="font-display text-5xl md:text-7xl lg:text-7xl font-bold text-white mb-6 
               leading-tight md:leading-none"
          >
            Smart Farming
            <span className="block text-amber-400">Starts Here</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Harness the power of AI, satellite imagery, and real-time data to
            predict crop yields, optimize resources, and maximize your
            farm&apos;s potential.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Button
              size="lg"
              className="group bg-[#FABE25] hover:bg-[#cb9a20] text-black 
               px-25 py-7 text-lg font-semibold rounded-xl cursor-pointer hover:-translate-y-1"
            >
              Start Free Analysis
              <ArrowRight className="ml-2 w-6 h-6 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-12 py-7 text-lg font-bold rounded-xl
               text-white border-white/30 hover:bg-white/20 bg-[#95A592] hover:text-white  cursor-pointer"
            >
              Watch Demo
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${feature.color} flex items-center justify-center`}
                >
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: "98%", label: "Prediction Accuracy" },
            { value: "50K+", label: "Farmers Served" },
            { value: "15+", label: "Crop Types" },
            { value: "24/7", label: "AI Monitoring" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10"
            >
              <div className="text-3xl md:text-4xl font-display font-bold text-amber-400 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-white/50" />
        </div>
      </div>
    </section>
  );
}
