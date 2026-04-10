"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import {
  TrendingUp,
  Leaf,
  CloudRain,
  Lightbulb,
  FlaskConical,
  AlertTriangle,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

/* ---------------- Animations ---------------- */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const stagger: Variants = {
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

export default function DemoPreview() {
  const ndviValue = 0.72;
  const ndviTrend = [0.45, 0.52, 0.6, 0.65, 0.7, 0.72];

  return (
    <section className="relative py-24 px-9 overflow-hidden bg-[#F8F8F2]">
      
      {/* 🌈 Background Glow */}
      <div className="absolute inset-0 bg-linear-to-br from-[#2FA36B]/10 via-transparent to-[#195733]/10 blur-3xl opacity-40"></div>

      <div className="container mx-auto relative">

        {/* 🔥 HEADER */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          animate="once"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >

          <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 leading-tight">
            From Raw Data to{" "}
            <span className="bg-linear-to-r from-[#195733] to-[#2FA36B] bg-clip-text text-transparent">
              Smart Decisions
            </span>
          </h2>

          <p className="text-muted-foreground text-lg">
            Experience how AI transforms satellite data, weather patterns, and
            soil insights into powerful farming decisions.
          </p>
        </motion.div>

        {/* 🧩 GRID */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >

          {/* CARD TEMPLATE */}
          {[
            {
              icon: <TrendingUp className="h-6 w-6 text-white" />,
              title: "Predicted Yield",
              value: "4,250 kg/ha",
              extra: (
                <div className="mt-3">
                  <div className="h-2 bg-[#E6EFEA] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
                      transition={{ duration: 1 }}
                      viewport={{ once: true }}
                      className="h-full bg-linear-to-r from-[#195733] to-[#2FA36B]"
                    />
                  </div>
                </div>
              ),
              bg: "from-[#195733] to-[#2FA36B]",
            },
            {
              icon: <Leaf className="h-6 w-6 text-white" />,
              title: "Crop Health",
              value: `NDVI: ${ndviValue}`,
              extra: (
                <div className="flex items-end gap-1 h-10 mt-3">
                  {ndviTrend.map((v, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${v * 40}px` }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="w-2 bg-green-500 rounded"
                    />
                  ))}
                </div>
              ),
              bg: "from-emerald-500 to-green-600",
            },
            {
              icon: <FlaskConical className="h-6 w-6 text-white" />,
              title: "Soil Health",
              value: "pH 6.8 (Optimal)",
              extra: <p className="text-sm mt-2">Organic Carbon: 0.72%</p>,
              bg: "from-[#7A4A2E] to-[#A36B4F]",
            },
            {
              icon: <CloudRain className="h-6 w-6 text-white" />,
              title: "Weather Impact",
              value: "Moderate Stress",
              extra: (
                <span className="text-sm text-amber-700">
                  ⚠️ Irrigation advised
                </span>
              ),
              bg: "from-amber-400 to-orange-500",
            },
            {
              icon: <AlertTriangle className="h-6 w-6 text-white" />,
              title: "Risk Alerts",
              value: "Pest: Medium",
              extra: <p className="text-sm mt-2">Disease: Low</p>,
              bg: "from-red-500 to-pink-500",
            },
            {
              icon: <Lightbulb className="h-6 w-6 text-white" />,
              title: "AI Recommendation",
              value: "Boost Nitrogen",
              extra: (
                <p className="text-sm mt-2">
                  Increase by 15% during flowering stage
                </p>
              ),
              bg: "from-blue-500 to-indigo-600",
            },
          ].map((card, index) => (
            <motion.div key={index} variants={fadeUp} whileHover={{ y: -8 }} viewport={{ once: true }}>
              
              {/* 🌟 CARD */}
              <Card className="relative rounded-2xl overflow-hidden border border-[#E6EFEA] shadow-xl hover:shadow-2xl transition duration-300">
                
                {/* gradient top bar */}
                <div className={`h-1 w-full bg-linear-to-r ${card.bg}`} />

                <CardContent className="p-6 space-y-4 bg-white/80 backdrop-blur-xl">

                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-linear-to-r ${card.bg}`}>
                      {card.icon}
                    </div>
                    <h3 className="font-semibold">{card.title}</h3>
                  </div>

                  <p className="text-xl font-bold">{card.value}</p>

                  {card.extra}

                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}