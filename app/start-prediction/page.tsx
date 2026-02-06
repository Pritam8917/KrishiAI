"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Leaf,
  MapPin,
  ArrowBigDown,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import axios from "axios";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type FarmProfile = {
  user_id: string;
  crop: string;
  village: string;
  district: string;
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
  farmer_advisory: string[];
};

/* ================= PAGE ================= */

export default function StartPrediction() {
  const [farm, setFarm] = useState<FarmProfile | null>(null);
  const [advisory, setAdvisory] = useState<AdvisoryData | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load farm + latest advisory
  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;

      const userId = data.user.id;

      const { data: farmData } = await supabase
        .from("farm_profiles")
        .select("user_id,crop,village,district,latitude,longitude")
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
    };

    loadData();
  }, []);

  // Auto generate advisory if missing
  const generateAdvisoryIfMissing = async () => {
    if (!farm?.latitude || !farm?.longitude || !farm?.user_id) return null;

    // Satellite
    const satRes = await axios.post("/api/sentinel/indices", {
      lat: farm.latitude,
      lon: farm.longitude,
    });

    const timeline = satRes.data.timeline;
    if (!timeline?.length) return null;

    const latest = timeline[timeline.length - 1];

    const ndvi = latest.ndvi;
    const ndwi = latest.ndwi;

    //  Weather
    const weatherRes = await axios.get(
      `/api/weather?lat=${farm.latitude}&lon=${farm.longitude}`,
    );

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
  const runPrediction = async () => {
    if (!farm) {
      alert("Farm profile not found");
      return;
    }
    if (!advisory) {
      alert("Satellite data not found");
      return;
    }

    setLoading(true);
    try {
      let finalAdvisory: AdvisoryData | null = advisory;

      if (!finalAdvisory) {
        finalAdvisory = await generateAdvisoryIfMissing();
      }

      if (!finalAdvisory) throw new Error("Advisory generation failed");

      const payload = {
        user_id: farm.user_id, // <-- REQUIRED
        ...finalAdvisory,
      };
      const res = await axios.post(
        [
          "https://krishiai-xa24.onrender.com/predict-yield",
          "http://localhost:8000/predict-yield",
        ][0],
        payload,
      );

      setResult(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("AI ERROR:", err.response?.data || err.message);
        alert("Error: " + JSON.stringify(err.response?.data || err.message));
      } else {
        console.error("UNKNOWN ERROR:", err);
        alert("Unexpected error occurred");
      }
    }

    setLoading(false);
  };
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
  return (
    <main className="min-h-screen bg-[#F8F8F2] px-5 py-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="text-white border border-white/30  w-fit bg-[#2FA36B] px-4 py-2 rounded-lg flex items-center gap-1 text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-linear-to-r from-[#195733] to-[#2FA36B] text-white">
            <CardContent className="py-10 flex flex-col md:flex-row justify-between gap-8">
              <div>
                <p className="opacity-90">AI Yield Forecast</p>
                <h1 className="text-4xl font-bold mt-2">
                  Predict your crop yield
                </h1>
                <p className="opacity-80 mt-2 text-sm max-w-md">
                  Based on satellite, weather and your farm profile.
                </p>
              </div>

              <Button
                onClick={runPrediction}
                disabled={loading}
                size="lg"
                className="bg-white text-[#195733] hover:bg-white/90 cursor-pointer px-8 py-5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:scale-105"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : result ? (
                  <ArrowBigDown />
                ) : (
                  <Sparkles />
                )}
                <span className="ml-2">
                  {loading
                    ? "Running AI..."
                    : result
                      ? "Prediction ready — scroll down to view results"
                      : "Run AI Prediction "}
                </span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* FARM SNAPSHOT */}
        {farm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Snapshot icon={<Leaf />} label="Crop" value={farm.crop} />
            <Snapshot
              icon={<MapPin />}
              label="Location"
              value={`${farm.village}, ${farm.district}`}
            />
          </div>
        )}

        {/* INPUT PREVIEW */}
        {advisory && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric title="NDVI" value={advisory.ndvi.toFixed(2)} />
            <Metric title="NDWI" value={advisory.ndwi.toFixed(2)} />
            <Metric title="Rain (7d)" value={`${advisory.rain7d} mm`} />
            <Metric title="Max Temp" value={`${advisory.maxtemp} °C`} />
          </div>
        )}

        {/* RESULT */}
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-l-4 border-[#195733]">
              <CardContent className="py-8 space-y-6">
                <h2 className="text-2xl font-bold text-[#195733]">
                  📊 Yield Forecast
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ResultCard
                    title="Predicted Yield"
                    value={`${result.yield_forecast.predicted_yield} ${result.yield_forecast.unit}`}
                  />
                  <ResultCard
                    title="Confidence Range"
                    value={result.yield_forecast.confidence_range}
                  />
                  <ResultCard
                    title="Potential After Improvement"
                    value={`${result.yield_forecast.potential_yield_after_improvement} ${result.yield_forecast.unit}`}
                  />
                </div>

                <div>
                  <p className="font-semibold">Key Yield Drivers</p>
                  <ul className="list-disc ml-6 text-sm text-gray-700">
                    {result.yield_explanation.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-semibold">AI Advisory</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {result.farmer_advisory}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}

/* ================= COMPONENTS ================= */

type SnapshotProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function Snapshot({ icon, label, value }: SnapshotProps) {
  return (
    <Card>
      <CardContent className="py-5 flex items-center gap-3">
        <div className="text-[#195733]">{icon}</div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type MetricProps = {
  title: string;
  value: string | number;
};

function Metric({ title, value }: MetricProps) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-bold text-[#195733]">{value}</p>
      </CardContent>
    </Card>
  );
}

type ResultCardProps = {
  title: string;
  value: string | number;
};

function ResultCard({ title, value }: ResultCardProps) {
  return (
    <Card>
      <CardContent className="py-6 text-center">
        <p className="text-xl text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-[#195733] mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
