"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Leaf, MapPin } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type FarmProfile = {
  user_id: string;
  crop: string;
  village: string;
  district: string;
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
        .select("user_id,crop,village,district")
        .eq("user_id", userId)
        .single();

      const { data: advisoryData } = await supabase
        .from("advisory_data")
        .select("rain7d,rain14d,maxtemp,humidity,windspeed,ndvi,ndwi")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(); // <-- important

      setFarm(farmData);
      setAdvisory(advisoryData);
    };

    loadData();
  }, []);

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

    const payload = {
      user_id: farm.user_id, // <-- REQUIRED
      rain7d: advisory.rain7d,
      rain14d: advisory.rain14d,
      maxtemp: advisory.maxtemp,
      humidity: advisory.humidity,
      windspeed: advisory.windspeed,
      ndvi: advisory.ndvi,
      ndwi: advisory.ndwi,
    };

    try {
      const res = await axios.post(
        ["https://krishiai-xa24.onrender.com/predict-yield","http://localhost:8000/predict-yield"][0],
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
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                <span className="ml-2">
                  {loading ? "Running AI..." : "Run AI Prediction"}
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
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-[#195733] mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
