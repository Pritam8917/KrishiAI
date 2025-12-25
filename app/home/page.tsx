"use client";

import { Button } from "@/app/components/ui/button";
import { ArrowRight, Leaf, BarChart3, Satellite, Sparkles } from "lucide-react";
import Header from "@/app/navbar/page";
import {
  motion,
  type Variants,
  useMotionValue,
  animate,
  useInView,
} from "framer-motion";
import { useEffect, useState, useRef } from "react";

/* ===================== CountUp ===================== */

interface CountUpProps {
  to: number;
  duration?: number;
  suffix?: string;
  start: boolean;
}

function CountUp({ to, duration = 1.5, suffix = "", start }: CountUpProps) {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!start) return;

    const controls = animate(count, to, {
      duration,
      onUpdate(latest) {
        setDisplay(Math.round(latest).toString());
      },
    });

    return controls.stop;
  }, [start, to, duration, count]);

  return (
    <motion.span>
      {display}
      {suffix}
    </motion.span>
  );
}

/* ===================== Animations ===================== */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const stagger: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const glowPulse: Variants = {
  animate: {
    boxShadow: [
      "0 0 0px rgba(250,190,37,0)",
      "0 0 45px rgba(250,190,37,0.45)",
      "0 0 0px rgba(250,190,37,0)",
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/* ===================== Component ===================== */

export default function HeroSection() {
  const features = [
    { icon: Leaf, label: "Soil Analysis", color: "bg-amber-700" },
    { icon: BarChart3, label: "Yield Prediction", color: "bg-emerald-700" },
    { icon: Satellite, label: "Satellite Monitoring", color: "bg-sky-600" },
    { icon: Sparkles, label: "AI Recommendations", color: "bg-amber-500" },
  ];

  /* 👇 Stats visibility detection */
  const statsRef = useRef<HTMLDivElement | null>(null);
  const statsInView = useInView(statsRef, { once: true });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Header />

      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/assets/hero-farm.jpg')]" />
      <div className="absolute inset-0 bg-linear-to-br from-emerald-950/80 via-emerald-900/70 to-amber-900/60" />

      {/* Floating blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-float delay-2000" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl animate-float delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">
              AI-Powered Agriculture Intelligence
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Smart Farming
            <span className="block text-amber-400">Starts Here</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            transition={{ delay: 0.15 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10"
          >
            Harness the power of AI, satellite imagery, and real-time data to
            predict crop yields, optimize resources, and maximize your farm’s
            potential.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
          >
            <motion.div variants={glowPulse} animate="animate" className="rounded-xl">
              <Button
                size="lg"
                className="bg-[#FABE25] hover:bg-[#cb9a20] text-black
                px-12 py-7 text-lg font-semibold rounded-xl
                transition-all hover:-translate-y-1 hover:scale-[1.03] cursor-pointer w-full "
              >
                Start Free Analysis
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </motion.div>

            <Button
              variant="outline"
              size="lg"
              className="px-12 py-7 text-lg font-bold rounded-xl
              text-white border-white/30 bg-[#95A592]
              transition-all hover:-translate-y-1 hover:bg-white/20 cursor-pointer"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                bg-white/10 backdrop-blur-md border border-white/10 text-white"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${feature.color} flex items-center justify-center`}
                >
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===================== STATS ===================== */}
        <motion.div
          ref={statsRef}
          variants={stagger}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: 98, suffix: "%", label: "Prediction Accuracy" },
            { value: 50, suffix: "K+", label: "Farmers Served" },
            { value: 15, suffix: "+", label: "Crop Types" },
            { value: 24, suffix: "/7", label: "AI Monitoring" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              whileHover={{ scale: 1.06 }}
              className="text-center p-4 rounded-xl
              bg-white/10 backdrop-blur-md border border-white/10"
            >
              <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">
                <CountUp
                  to={stat.value}
                  suffix={stat.suffix}
                  start={statsInView}
                />
              </div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
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
