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

/* ---------------- Animations (TS Safe) ---------------- */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const stagger: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const pulseAlert: Variants = {
  animate: {
    boxShadow: [
      "0 0 0px rgba(245,158,11,0)",
      "0 0 25px rgba(245,158,11,0.45)",
      "0 0 0px rgba(245,158,11,0)",
    ],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/* ---------------- Component ---------------- */

export default function DemoPreview() {
  const ndviValue = 0.72;
  const ndviTrend = [0.45, 0.52, 0.6, 0.65, 0.7, 0.72];

  return (
    <section
      className="
        py-24 px-11
        bg-[radial-gradient(ellipse_at_center,rgba(47,163,107,0.15)_0%,rgba(248,248,242,0.85)_55%,white_100%)]
      "
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            From Farm Data to Smart Decisions
          </h2>
          <p className="text-muted-foreground">
            See how AI transforms raw data into meaningful guidance.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* 1️⃣ Yield Prediction */}
          <motion.div variants={fadeUp} whileHover={{ y: -6 }}>
            <Card className="bg-white/80 backdrop-blur border border-[#E6EFEA] shadow-lg rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#195733]/10">
                    <TrendingUp className="h-6 w-6 text-[#195733]" />
                  </div>
                  <h3 className="font-semibold">Predicted Yield</h3>
                </div>

                <p className="text-2xl font-bold text-[#195733]">
                  4,250 kg/ha
                </p>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E6EFEA] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-linear-to-r from-[#195733] to-[#2FA36B]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2️⃣ Crop Health (NDVI) */}
          <motion.div variants={fadeUp} whileHover={{ y: -6 }}>
            <Card className="bg-white/80 backdrop-blur border border-[#E6EFEA] shadow-lg rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-100">
                    <Leaf className="h-6 w-6 text-emerald-700" />
                  </div>
                  <h3 className="font-semibold">Crop Health (NDVI)</h3>
                </div>

                <p className="text-lg font-semibold text-emerald-700">
                  NDVI: {ndviValue} – Healthy
                </p>

                {/* NDVI Scale */}
                <div className="relative h-2 rounded-full bg-linear-to-r from-red-400 via-yellow-400 to-emerald-600">
                  <motion.div
                    initial={{ left: "0%" }}
                    whileInView={{ left: `${ndviValue * 100}%` }}
                    transition={{ duration: 1 }}
                    className="absolute -top-1 w-1 h-4 bg-black rounded"
                  />
                </div>

                {/* NDVI Trend */}
                <div className="flex items-end gap-1 h-10 mt-3">
                  {ndviTrend.map((v, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${v * 40}px` }}
                      transition={{ delay: i * 0.1 }}
                      className="w-2 rounded bg-emerald-500"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3️⃣ Soil Health */}
          <motion.div variants={fadeUp} whileHover={{ y: -6 }}>
            <Card className="bg-white/80 backdrop-blur border border-[#E6EFEA] shadow-lg rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#7A4A2E]/10">
                    <FlaskConical className="h-6 w-6 text-[#7A4A2E]" />
                  </div>
                  <h3 className="font-semibold">Soil Health</h3>
                </div>

                <p className="text-sm">
                  pH Level: <b>6.8</b> (Optimal)
                </p>
                <p className="text-sm">
                  Organic Carbon: <b>0.72%</b>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 4️⃣ Weather Risk */}
          <motion.div variants={fadeUp} whileHover={{ y: -6 }}>
            <motion.div variants={pulseAlert} animate="animate" className="rounded-2xl">
              <Card className="bg-white/80 backdrop-blur border border-[#E6EFEA] shadow-lg rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-100">
                      <CloudRain className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold">Weather Impact</h3>
                  </div>

                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-amber-200 text-amber-800">
                    ⚠️ Moderate Water Stress
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* 5️⃣ Risk Alerts */}
          <motion.div variants={fadeUp} whileHover={{ y: -6 }}>
            <Card className="bg-white/80 backdrop-blur border border-[#E6EFEA] shadow-lg rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold">Risk Alerts</h3>
                </div>

                <p className="text-sm">
                  Pest Risk: <b>Medium</b>
                </p>
                <p className="text-sm">
                  Disease Risk: <b>Low</b>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 6️⃣ AI Recommendation */}
          <motion.div variants={fadeUp} whileHover={{ y: -6 }}>
            <Card className="bg-white/80 backdrop-blur border border-[#E6EFEA] shadow-lg rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Lightbulb className="h-6 w-6 text-blue-700" />
                  </div>
                  <h3 className="font-semibold">AI Recommendation</h3>
                </div>

                <p className="text-sm">
                  Increase nitrogen application by <b>15%</b> during flowering
                  stage for better yield.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
