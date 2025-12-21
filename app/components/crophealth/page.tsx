"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Leaf,
  Satellite,
  TrendingUp,
  Info,
  MapPin,
  Clock,
  ShieldAlert,
} from "lucide-react";

import Header from "../navbar/page";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

/* ---------------- ANIMATIONS ---------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function CropHealthPage() {
  const [hasReportedIssue, setHasReportedIssue] = useState(false);
  const [farmLocation, setFarmLocation] = useState<{
    state: string;
    district: string;
    block: string;
    village: string;
    cropType: string;
  } | null>(null);
  useEffect(() => {
    const fetchFarmProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("farm_profiles")
        .select("state, district, block, village, crop")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setFarmLocation({
          state: data.state ?? "",
          district: data.district ?? "",
          block: data.block ?? "",
          village: data.village ?? "",
          cropType: data.crop ?? "",
        });
      }
    };

    fetchFarmProfile();
  }, []);
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F8F2] px-6 pt-28 md:pt-36 pb-16">
        <div className="max-w-6xl mx-auto space-y-14">
          {/* ================= PAGE HEADER ================= */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-3xl font-bold text-[#195733]">
              Crop Health{" "}
              <span className="text-base font-medium text-gray-600">
                (Satellite & Field View)
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Continuous crop monitoring using satellite & weather data.
            </p>
          </motion.div>

          {/* ================= FARM SUMMARY ================= */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="grid md:grid-cols-3 gap-6"
          >
            <Card>
              <CardContent className="py-5 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#195733]" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-semibold">
                    {" "}
                    {farmLocation
                      ? `${farmLocation.village}, ${farmLocation.district}, ${farmLocation.state}`
                      : "Loading..."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-5 flex items-center gap-3">
                <Leaf className="w-5 h-5 text-[#195733]" />
                <div>
                  <p className="text-xs text-gray-500">Crop</p>
                  <p className="font-semibold">{farmLocation?.cropType || "Loading..."}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-5 flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#195733]" />
                <div>
                  <p className="text-xs text-gray-500">Growth Stage</p>
                  <p className="font-semibold">Vegetative Stage</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ================= OVERALL STATUS ================= */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Card
              className={`border-l-4 ${
                hasReportedIssue
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-[#2FA36B]"
              }`}
            >
              <CardContent className="py-6 space-y-2">
                <div className="flex items-center gap-3">
                  <Leaf
                    className={`w-7 h-7 ${
                      hasReportedIssue ? "text-yellow-600" : "text-[#2FA36B]"
                    }`}
                  />
                  <h2 className="text-xl font-semibold">
                    {hasReportedIssue
                      ? "Needs Attention"
                      : "Satellite Vegetation Status: Normal"}
                  </h2>
                </div>

                <p className="text-sm text-gray-600">
                  {hasReportedIssue
                    ? "A field issue has been reported. Monitoring recovery."
                    : "Vegetation activity appears normal in recent imagery."}
                </p>

                <p className="text-xs text-gray-500">
                  Last satellite update: 4 days ago
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* ================= HEALTH METRICS ================= */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Leaf,
                title: "Vegetation Health",
                main: "NDVI: 0.68 (Normal)",
                sub: "Trend: Stable",
                note: "Based on last satellite pass",
              },
              {
                icon: TrendingUp,
                title: "Weather Impact",
                main: "Rainfall (7 days): 42 mm",
                sub: "Temperature stress: Low",
                note: "No heat stress expected",
              },
              {
                icon: Satellite,
                title: "Water & Soil",
                main: "Soil moisture: Adequate",
                sub: "Irrigation: Not required",
                note: "Avoid over-watering",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <Card className="hover:shadow-xl transition-all">
                  <CardContent className="py-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#195733]/10">
                        <item.icon className="w-5 h-5 text-[#195733]" />
                      </div>
                      <h4 className="font-semibold">{item.title}</h4>
                    </div>
                    <p className="text-sm font-medium text-[#195733]">
                      {item.main}
                    </p>
                    <p className="text-sm text-gray-600">{item.sub}</p>
                    <p className="text-xs text-gray-500 border-t pt-2">
                      {item.note}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* ================= RISK WATCH ================= */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Card>
              <CardContent className="py-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  Risk Watch (Next 7 Days)
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• No major disease risk detected</li>
                  <li>• Monitor humidity for fungal stress</li>
                  <li>• Avoid excess irrigation</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* ================= FIELD ISSUE ================= */}
          {hasReportedIssue && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card className="border-l-4 border-yellow-500 bg-yellow-50">
                <CardContent className="py-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-yellow-700">
                      Field Observation Reported
                    </h3>
                  </div>

                  <p className="text-sm text-yellow-700">
                    Issue: <b>Yellow leaves</b>
                    <br />
                    Likely cause: Nutrient deficiency
                    <br />
                    Status: Action required
                  </p>

                  <div className="flex gap-3 pt-2">
                    <Button>View Recommended Action</Button>
                    <Button variant="outline">Mark Action Taken</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ================= CTA ================= */}
          {!hasReportedIssue && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card className="border-dashed bg-white">
                <CardContent className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    Noticing yellow leaves, pests, or damage in your field?
                  </p>
                  <Button
                    onClick={() => setHasReportedIssue(true)}
                    className="bg-[#195733]"
                  >
                    Report a Problem
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
