"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Leaf,
  ArrowBigDown,
  ArrowLeft,
  Sprout,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import axios from "axios";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type FarmProfile = {
  user_id: string;
  crop: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
};

type AdvisoryData = {
  rain7d: number;
  rain14d: number;
  maxtemp: number;
  humidity: number;
  windspeed: number;
  ndvi: number;
  ndwi: number;
};

type PredictionResult = {
  yield_forecast: {
    predicted_yield: number;
    unit: string;
    confidence_range: string;
    potential_yield_after_improvement: number;
  };
  yield_explanation: string[];

  advisory: {
    growth_stage: string;
    priority_actions: string[];
    recommendations: string[]; // ✅ FIXED
    do_not_do: string[];
    risk_levels: {
      water_stress_risk: string;
      nutrient_stress_risk: string;
      disease_risk: string;
    };
  };
};

/* ================= PAGE ================= */

export default function StartPrediction() {
  const [farm, setFarm] = useState<FarmProfile | null>(null);
  const [advisory, setAdvisory] = useState<AdvisoryData | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Load farm + latest advisory
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await supabase.auth.getUser();

        if (!data?.user) {
          setAuthLoading(false);
          return;
        }

        const userId = data.user.id;

        const { data: farmData } = await supabase
          .from("farm_profiles")
          .select("user_id,crop,state,district,latitude,longitude")
          .eq("user_id", userId)
          .single();

        const { data: advisoryData } = await supabase
          .from("advisory_data")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setFarm(farmData);
        setAdvisory(advisoryData);
      } finally {
        setAuthLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto generate advisory if missing
  const generateAdvisoryIfMissing = async () => {
    if (!farm?.latitude || !farm?.longitude || !farm?.user_id) return null;

    // Satellite & Weather API calls
    const [satRes, weatherRes] = await Promise.all([
      axios.post("/api/sentinel/indices", {
        lat: farm.latitude,
        lon: farm.longitude,
      }),
      axios.get(`/api/weather?lat=${farm.latitude}&lon=${farm.longitude}`),
    ]);

    const timeline = satRes.data.timeline;
    if (!timeline?.length) return null;

    const latest = timeline[timeline.length - 1];

    const ndvi = latest.ndvi;
    const ndwi = latest.ndwi;

    const weather = weatherRes.data;

    const rain7d = weather.daily.precipitation_sum
      .slice(-7)
      .reduce((a: number, b: number) => a + b, 0);

    const rain14d = weather.daily.precipitation_sum.reduce(
      (a: number, b: number) => a + b,
      0,
    );

    const maxtemp = Math.max(...weather.daily.temperature_2m_max);
    const humidity = Math.max(...weather.daily.relative_humidity_2m_mean);
    const windspeed = Math.max(...weather.daily.wind_speed_10m_max);

    const newAdvisory = {
      user_id: farm.user_id,
      rain7d,
      rain14d,
      maxtemp,
      humidity,
      windspeed,
      ndvi,
      ndwi,
    };

    //  Save to Supabase
    await supabase.from("advisory_data").insert([newAdvisory]);
    setAdvisory(newAdvisory);
    return newAdvisory;
  };

  // Run AI
  const scrollToResults = () => {
    const el = document.getElementById("results");
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handlePredictionClick = async () => {
    if (result) {
      scrollToResults(); // If result exists → scroll
    } else {
      await runPrediction(); // Else → run prediction
    }
  };
  useEffect(() => {
    if (farm && !advisory) {
      generateAdvisoryIfMissing(); // preload in background
    }
  }, [farm]);

  const runPrediction = async () => {
    if (!farm) {
      alert("Farm profile not found");
      return;
    }

    if (!advisory) {
      alert("Preparing satellite data... Please wait a moment.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user_id: farm.user_id,
        ...advisory,
      };

      const res = await axios.post(
        "https://krishiai-xa24.onrender.com/predict-yield",
        payload,
      );
      console.log("RESULT:", res.data);
      setResult(res.data);

    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("AI ERROR:", err.response?.data || err.message);
        alert("Error: " + JSON.stringify(err.response?.data || err.message));
      } else {
        console.error("UNKNOWN ERROR:", err);
        alert("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };
  if (authLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#F8F8F2] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_4px_4px,rgba(25,87,51,0.15)_3px,transparent_3px)] bg-size-[36px_36px] opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 flex items-center justify-center">
            <Sprout className="w-12 h-12 text-[#195733] animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-[#195733]">
            Preparing AI Insights
          </h2>

          <p className="text-sm text-gray-600">
            Analyzing satellite, weather & farm data
          </p>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-6 bg-[#F6FBF8] overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 
      bg-[radial-gradient(circle_at_2px_2px,rgba(25,87,51,0.12)_2px,transparent_2px)]
      bg-size-[32px_32px] opacity-40 pointer-events-none"
        />

        {/* Glass Card */}
        <div className="relative z-10 w-full max-w-md">
          <div
            className="
        bg-white/70 backdrop-blur-2xl
        border border-[#E3EFE8]
        shadow-[0_20px_60px_rgba(0,0,0,0.08)]
        rounded-3xl
        p-10
        text-center
        transition-all duration-300
        hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]
      "
          >
            {/* Icon */}
            <div
              className="
          mx-auto mb-7
          h-20 w-20
          rounded-3xl
          bg-linear-to-br from-[#195733] via-[#237a4b] to-[#2FA36B]
          flex items-center justify-center
          shadow-lg
        "
            >
              <Leaf className="w-9 h-9 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-[#195733] tracking-tight">
              Login Required
            </h2>

            {/* Description */}
            <p className="mt-3 text-sm leading-relaxed text-gray-600 max-w-sm mx-auto">
              Crop health insights are personalized for your farm. Sign in to
              access satellite intelligence, weather analytics, and AI-powered
              recommendations.
            </p>

            {/* Buttons */}
            <div className="mt-8 space-y-4">
              <Button
                size="lg"
                onClick={() => router.push("/auth/login")}
                className="
              w-full py-6 text-base font-semibold rounded-xl
              bg-linear-to-r from-[#195733] to-[#2FA36B]
              text-white shadow-md
              hover:shadow-xl hover:-translate-y-0.5
              transition-all duration-300 cursor-pointer
            "
              >
                Login to Continue
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/")}
                className="
              w-full py-6 text-base font-semibold rounded-xl
              border-[#195733]/30 text-[#195733]
              hover:bg-[#195733]/10
              transition-all cursor-pointer
            "
              >
                Back to Home
              </Button>
            </div>

            {/* Trust Note */}
            <p className="mt-7 text-xs text-gray-500">
              🔒 Your farm data is encrypted & used only for insights
            </p>
          </div>
        </div>
      </div>
    );
  }
  const aiAdvisory = result?.advisory || ({} as PredictionResult['advisory']);
  return (
    <main className="min-h-screen bg-linear-to-br from-[#F4FAF7] to-[#E6F4EC] px-5 py-14">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* BACK */}
        <Button
          onClick={() => router.push("/")}
          className="bg-[#2FA36B] text-white px-4 py-2 rounded-lg shadow hover:bg-[#248a59] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-linear-to-r from-[#195733] to-[#2FA36B] text-white rounded-3xl p-10 flex flex-col md:flex-row justify-between items-center shadow-xl">
            <div>
              <p className="text-sm opacity-80">🌾 Smart Farming AI</p>
              <h1 className="text-4xl font-bold mt-2">Crop Yield Prediction</h1>
              <p className="text-sm opacity-80 mt-2 max-w-md">
                AI-powered insights using satellite + weather data.
              </p>
            </div>

            <Button
              onClick={handlePredictionClick}
              disabled={loading}
              className="bg-white hover:bg-amber-50 text-[#195733] px-8 py-5 rounded-xl font-semibold mt-6 md:mt-0 flex items-center gap-2 shadow transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : result ? (
                <ArrowBigDown />
              ) : (
                <Sparkles />
              )}
              {loading ? "Analyzing..." : result ? "View Result" : "Run AI"}
            </Button>
          </div>
        </motion.div>

        {/* FARM */}
        {farm && (
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl shadow border">
              <p className="text-xs text-gray-500">Crop</p>
              <p className="font-bold text-[#195733]">{farm.crop}</p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow border">
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-bold text-[#195733]">
                {farm.district}, {farm.state}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow border">
              <p className="text-xs text-gray-500">Monitoring</p>
              <p className="font-bold text-[#195733]">Active</p>
            </div>
          </div>
        )}

        {/* METRICS */}
        {advisory && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: "NDVI", value: advisory.ndvi.toFixed(2) },
              { label: "NDWI", value: advisory.ndwi.toFixed(2) },
              { label: "Rain", value: advisory.rain7d + " mm" },
              { label: "Temp", value: advisory.maxtemp + " °C" },
            ].map((m, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow border">
                <p className="text-xs text-gray-500">{m.label}</p>
                <p className="text-xl font-bold text-[#195733]">{m.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* RESULT */}
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-3xl shadow-xl border p-8 space-y-8">
              {/* TITLE */}
              <h2 className="text-3xl font-bold text-[#195733]">
                📊 AI Yield Report
              </h2>
              {/* MAIN RESULT */}
              <div className="bg-linear-to-r from-[#E6F7EF] to-[#F0FAF5] p-8 rounded-2xl text-center border">
                <p className="text-sm text-gray-600">Predicted Yield</p>
                <p className="text-5xl font-bold text-[#195733] mt-2">
                  {result.yield_forecast.predicted_yield}
                </p>
                <p className="text-sm text-gray-500">
                  {result.yield_forecast.unit}
                </p>
              </div>
              {/* STATS */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <p className="text-sm text-gray-500">Confidence</p>
                  <p className="text-xl font-bold text-[#195733]">
                    {result.yield_forecast.confidence_range}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <p className="text-sm text-gray-500">Potential Yield</p>
                  <p className="text-xl font-bold text-[#195733]">
                    {Number(
                      result.yield_forecast.potential_yield_after_improvement,
                    ).toFixed(2)}{" "}
                    {result.yield_forecast.unit}
                  </p>
                </div>
              </div>
              {/* DRIVERS */}
              <div className="bg-[#F9FCFA] p-6 rounded-2xl border">
                <p className="font-semibold text-[#195733] mb-3">
                  🌿 Key Factors
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {result.yield_explanation.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="w-2 h-2 bg-[#195733] rounded-full mt-2" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              {/* ===================== ADVISORY SYSTEM ===================== */}
              
              <div className="space-y-8">
                {/* HEADER */}
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-[#195733] flex items-center gap-2">
                    🤖 AI Advisory System
                  </h3>
                  <span className="text-xs bg-[#195733]/10 text-[#195733] px-3 py-1 rounded-full">
                    Smart AI
                  </span>
                </div>

                {/* 🌱 Growth Stage */}
                <div className="bg-linear-to-r from-[#E6F7EF] to-[#F4FAF7] border rounded-xl p-5 shadow-sm">
                  <p className="text-xs text-gray-500">Growth Stage</p>
                  <p className="text-xl font-bold text-[#195733] capitalize">
                    {aiAdvisory.growth_stage || "Unknown"}
                  </p>
                </div>

                {/* ⚠️ Risk Dashboard */}
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(aiAdvisory.risk_levels || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="p-4 rounded-xl border bg-white shadow-sm flex flex-col items-center hover:shadow-md transition"
                      >
                        <p className="text-xs text-gray-500 capitalize">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p
                          className={`font-bold text-lg ${
                            value === "High"
                              ? "text-red-500"
                              : value === "Medium"
                                ? "text-amber-500"
                                : "text-green-600"
                          }`}
                        >
                          {value}
                        </p>
                      </div>
                    ),
                  )}
                </div>

                {/* 🚀 Priority Actions */}
                <div>
                  <h4 className="font-semibold text-[#195733] mb-3">
                    🚀 Priority Actions
                  </h4>
                  <div className="grid gap-3">
                    {(aiAdvisory.priority_actions || []).map((action, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 bg-[#F4FAF7] border border-[#DCEFE6] rounded-xl p-4 hover:shadow-md transition"
                      >
                        <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#195733] text-white text-sm font-bold">
                          {i + 1}
                        </div>
                        <p className="text-sm text-gray-700">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 🤖 Recommendations */}
                <div>
                  <h4 className="font-semibold text-[#195733] mb-3">
                    🤖 Recommendations
                  </h4>
                  <div className="grid gap-3">
                    {(aiAdvisory.recommendations || []).map((point, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                      >
                        <span className="w-2 h-2 bg-[#195733] rounded-full mt-2" />
                        <p className="text-sm text-gray-700">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ❌ Do Not Do */}
                <div>
                  <h4 className="font-semibold text-red-500 mb-3">
                    ❌ Avoid These Actions
                  </h4>
                  <div className="grid gap-3">
                    {(aiAdvisory.do_not_do || []).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4"
                      >
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                        <p className="text-sm text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
