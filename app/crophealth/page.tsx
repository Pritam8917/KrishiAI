"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  Satellite,
  MapPin,
  ShieldAlert,
  Sprout,
  Info,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import axios from "axios";
import Header from "@/app/navbar/page";
import { Card, CardContent } from "@/app/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

import {
  getWaterStress,
  getVegetationStatus,
  getLeachingRisk,
  getDiseaseRisk,
} from "@/lib/ai/cropHealthLogic";

import type { FarmProfile, WeatherData } from "@/lib/types/cropHealth";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const InlineLoader = () => (
  <Loader2 className="w-5 h-5 animate-spin text-white/80" />
);

export default function CropHealth() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [farm, setFarm] = useState<FarmProfile | null>(null);
  const [ndvi, setNdvi] = useState<number | null>(null);
  const [ndwi, setNdwi] = useState<number | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [saved, setSaved] = useState(false); // Prevent duplicate DB insert

  /* ================= FETCH FARM PROFILE ================= */

  useEffect(() => {
    const loadFarm = async () => {
      try {
        const { data } = await supabase.auth.getUser();

        if (!data?.user) {
          setAuthLoading(false);
          return;
        }

        const userID = data.user.id;
        setUserId(userID);

        const { data: farmData } = await supabase
          .from("farm_profiles")
          .select("state,district,village,crop,latitude,longitude")
          .eq("user_id", userID)
          .single();

        setFarm(farmData);
      } finally {
        setAuthLoading(false);
        setLoading(false);
      }
    };

    loadFarm();
  }, []);

  /* ================= FETCH SATELLITE ================= */

  useEffect(() => {
    if (!farm?.latitude || !farm?.longitude) return;

    axios
      .post("/api/sentinel/indices", {
        lat: farm.latitude,
        lon: farm.longitude,
      })
      .then((res) => {
        const timeline = res.data.timeline;
        if (!timeline?.length) return;

        const latest = timeline[timeline.length - 1];
        setNdvi(latest.ndvi);
        setNdwi(latest.ndwi);
      })
      .catch(console.error);
  }, [farm]);

  /* ================= FETCH WEATHER ================= */

  useEffect(() => {
    if (!farm?.latitude || !farm?.longitude) return;

    axios
      .get(`/api/weather?lat=${farm.latitude}&lon=${farm.longitude}`)
      .then((res) => setWeather(res.data))
      .catch(console.error);
  }, [farm]);

  /* ================= WEATHER METRICS ================= */

  const rain7d =
    weather?.daily.precipitation_sum?.slice(-7).reduce((a, b) => a + b, 0) ?? 0;

  const rain14d =
    weather?.daily.precipitation_sum?.reduce((a, b) => a + b, 0) ?? 0;

  const maxtemp = weather ? Math.max(...weather.daily.temperature_2m_max) : 0;

  const avgHumidity = weather
    ? Math.max(...weather.daily.relative_humidity_2m_mean)
    : 0;

  const windspeed = weather
    ? Math.max(...weather.daily.wind_speed_10m_max)
    : undefined;

  /* ================= SAVE ADVISORY ================= */

  interface AdvisoryPayload {
    user_id: string;
    rain7d: number;
    rain14d: number;
    maxtemp: number;
    humidity: number;
    windspeed: number | undefined;
    ndvi: number;
    ndwi: number;
  }

  const saveAdvisory = useCallback(
    async (payload: AdvisoryPayload) => {
      if (!userId) return;

      try {
        const { error } = await supabase.from("advisory_data").insert([
          {
            user_id: userId,
            rain7d: payload.rain7d,
            rain14d: payload.rain14d,
            maxtemp: payload.maxtemp,
            humidity: payload.humidity,
            windspeed: payload.windspeed,
            ndvi: payload.ndvi,
            ndwi: payload.ndwi,
          },
        ]);

        if (error) console.error("Supabase Insert Error:", error);
        else console.log("Advisory Saved");
      } catch (err) {
        console.error("Save Advisory Failed:", err);
      }
    },
    [userId],
  );

  /* ================= SEND TO AI + SAVE ================= */

  useEffect(() => {
    if (ndvi === null || ndwi === null || !weather || !userId || saved) return;

    const runPipeline = async () => {
      const payload = {
        user_id: userId,
        rain7d,
        rain14d,
        maxtemp,
        humidity: avgHumidity,
        windspeed,
        ndvi,
        ndwi,
      };

      try {
        await saveAdvisory(payload);
        setSaved(true);
        console.log("Advisory Saved Successfully");
      } catch (err) {
        console.error("Pipeline Error:", err);
      }
    };

    runPipeline();
  }, [
    ndvi,
    ndwi,
    weather,
    userId,
    saved,
    rain7d,
    rain14d,
    maxtemp,
    avgHumidity,
    windspeed,
    saveAdvisory,
  ]);

  /* ================= AI UI LOGIC ================= */

  const vegetation =
    ndvi === null ? <InlineLoader /> : getVegetationStatus(ndvi);

  const waterStress =
    ndwi === null || !weather ? (
      <InlineLoader />
    ) : (
      getWaterStress({
        ndwi,
        rain14d,
        windSpeed: windspeed,
      })
    );

  const leachingRisk =
    ndvi === null || !weather ? (
      <InlineLoader />
    ) : (
      getLeachingRisk({ rain7d, ndvi })
    );

  const diseaseRisk =
    ndvi === null || !weather ? (
      <InlineLoader />
    ) : (
      getDiseaseRisk({
        humidity: avgHumidity,
        temp: maxtemp,
        rainDays:
          weather.daily.precipitation_sum?.slice(-7).filter((r) => r >= 1)
            .length ?? 0,
        ndvi,
      })
    );

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
  if (
    loading ||
    authLoading ||
    ndvi === null ||
    ndwi === null ||
    weather === null ||
    waterStress === null ||
    vegetation === null ||
    leachingRisk === null ||
    diseaseRisk === null
  ) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#F8F8F2] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_4px_4px,rgba(25,87,51,0.15)_3px,transparent_3px)] bg-size-[36px_36px] opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 flex items-center justify-center">
            <Sprout className="w-12 h-12 text-[#195733] animate-pulse" />
          </div>
          <p className="text-xl font-medium text-[#195733]">
            Fetching Crop Health...
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F8F2] px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* ================= HERO ================= */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Card className="bg-linear-to-r from-[#195733] to-[#2FA36B] text-white">
              <CardContent className="py-8 flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <p className="text-sm opacity-90">Overall Crop Health</p>
                  <h1 className="text-2xl sm:text-3xl font-semibold mt-1">
                    {vegetation}
                  </h1>

                  <p className="text-xs opacity-80 mt-1">Satellite + Weather</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs opacity-80">NDVI</p>
                    <p className="text-xl font-semibold">{ndvi.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80">NDWI</p>
                    <p className="text-xl font-semibold">{ndwi.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80">Water Stress</p>
                    <p className="text-lg sm:text-xl font-semibold">
                      {waterStress}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ================= FARM SUMMARY ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardContent className="py-5 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#195733]" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-semibold">
                    {farm.village}, {farm.district}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-5 flex items-center gap-3">
                <Leaf className="w-5 h-5 text-[#195733]" />
                <div>
                  <p className="text-xs text-gray-500">Crop</p>
                  <p className="font-semibold">{farm.crop}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-5 flex items-center gap-3">
                <Satellite className="w-5 h-5 text-[#195733]" />
                <div>
                  <p className="text-xs text-gray-500">Satellite Update</p>
                  <p className="font-semibold">Last 3–5 days</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ================= INSIGHT CARDS ================= */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <Insight title="Vegetation" value={vegetation} />
            <Insight title="Water Stress" value={waterStress} />
            <Insight title="Leaching Risk" value={leachingRisk} />
            <Insight title="Disease Risk" value={diseaseRisk} />
          </div>

          {/* ================= WEATHER IMPACT ================= */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border-l-4 border-sky-600 bg-[#F4FAFF]">
              <CardContent className="py-6">
                <h3 className="font-semibold mb-5 flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-sky-600" />
                  Weather Impact on Crop
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-sm">
                  {/* 🌧️ Rainfall */}
                  <div className="space-y-1">
                    <p className="text-gray-500">Rainfall (last 7 days)</p>

                    <p className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                      <span className="text-gray-800">
                        {rain7d.toFixed(1)} mm
                      </span>

                      {rain7d > 60 ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : rain7d < 15 ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </p>

                    <p
                      className={`text-xs sm:text-sm mt-1 ${
                        rain7d > 60
                          ? "text-red-600"
                          : rain7d < 15
                            ? "text-amber-600"
                            : "text-green-600"
                      }`}
                    >
                      {rain7d > 60
                        ? "Excess rainfall → nutrient leaching risk"
                        : rain7d < 15
                          ? "Low rainfall → possible water stress"
                          : "Rainfall within optimal range"}
                    </p>
                  </div>

                  {/* 🌡️ Temperature */}
                  <div className="space-y-1">
                    <p className="text-gray-500">Maximum Temperature</p>

                    <p className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                      <span className="text-gray-800">
                        {maxtemp.toFixed(1)} °C
                      </span>

                      {maxtemp > 35 ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </p>

                    <p
                      className={`text-xs sm:text-sm mt-1 ${
                        maxtemp > 35 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {maxtemp > 35
                        ? "High temperature → heat stress risk"
                        : "Temperature suitable for crop growth"}
                    </p>
                  </div>

                  {/* 💧 Humidity */}
                  <div className="space-y-1">
                    <p className="text-gray-500">Average Humidity</p>

                    <p className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                      <span className="text-gray-800">
                        {avgHumidity.toFixed(0)} %
                      </span>

                      {avgHumidity > 75 ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </p>

                    <p
                      className={`text-xs sm:text-sm mt-1 ${
                        avgHumidity > 75 ? "text-amber-600" : "text-green-600"
                      }`}
                    >
                      {avgHumidity > 75
                        ? "High humidity → fungal disease risk"
                        : "Humidity level is safe"}
                    </p>
                  </div>

                  {/* 🌬️ Wind Speed */}
                  {windspeed !== undefined && (
                    <div className="space-y-1">
                      <p className="text-gray-500">Wind Speed (Max)</p>
                      <p className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                        <span className="text-gray-800">
                          {windspeed.toFixed(1)} km/h
                        </span>

                        {windspeed > 25 ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </p>

                      <p
                        className={`text-xs sm:text-sm mt-1 ${
                          windspeed > 25 ? "text-amber-600" : "text-green-600"
                        }`}
                      >
                        {windspeed > 25
                          ? "Strong wind → higher evaporation risk"
                          : "Wind conditions are normal"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ================= ADVISORY ================= */}
          <Card className="border-l-4 border-[#195733]">
            <CardContent className="py-6 ">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#195733]" />
                Today’s Advisory
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {waterStress === "Severe" && (
                  <li>• Immediate irrigation required</li>
                )}
                {leachingRisk === "High" && (
                  <li>• Avoid fertilizer due to leaching risk</li>
                )}
                {diseaseRisk !== "Low" && (
                  <li>• Monitor crop for fungal symptoms</li>
                )}
                {waterStress === "Low" && <li>• Crop condition is stable</li>}
              </ul>
            </CardContent>
          </Card>

          {/* ================= RISK WATCH ================= */}
          <Card>
            <CardContent className="py-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Risk Watch (Next 7 Days)
              </h3>
              <p className="text-sm text-gray-600">
                Forecast-based alerts will appear here.
              </p>
            </CardContent>
          </Card>
          {/* ================= REPORT PROBLEM CTA ================= */}
          <Card className="mt-12 bg-[#F4FAF6]">
            <CardContent className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-sm text-gray-700 max-w-xl flex items-center gap-3">
                <Info className="w-7 h-7 text-red-900" /> Noticed any change in
                your crop like leaf color, spots, slow growth or pests? Tell us
                what you see and get guidance.
              </p>

              <button
                onClick={() => router.push("/currentproblem")}
                className=" bg-[#195733] text-white  px-6 py-3 sm:px-8 sm:py-3  rounded-lg  text-sm sm:text-base  font-semibold  hover:bg-[#144a2b] transition  w-full sm:w-auto cursor-pointer"
              >
                Report a Problem
              </button>
            </CardContent>
          </Card>

          <p className="text-xs text-gray-500 flex items-center gap-2">
            <Info className="w-4 h-4" /> Data sourced from Sentinel‑2 &
            Open‑Meteo
          </p>
        </div>
      </main>
    </>
  );
}
type InsightProps = {
  title: string;
  value: React.ReactNode;
};

export function Insight({ title, value }: InsightProps) {
  return (
    <Card>
      <CardContent className="py-6">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-[#195733] mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
