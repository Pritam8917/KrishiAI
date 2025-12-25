"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import axios from "axios";
import Header from "@/app/navbar/page";
import { Card, CardContent } from "@/app/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
//  AI LOGIC (pure functions)
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

export default function CropHealth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [farm, setFarm] = useState<FarmProfile | null>(null);
  const [ndvi, setNdvi] = useState<number | null>(null);
  const [ndwi, setNdwi] = useState<number | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  /* ================= FETCH FARM PROFILE ================= */
  useEffect(() => {
    const loadFarm = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return setLoading(false);

      const { data: farmData } = await supabase
        .from("farm_profiles")
        .select("state,district,village,crop,latitude,longitude")
        .eq("user_id", data.user.id)
        .single();

      setFarm(farmData);
      setLoading(false);
    };

    loadFarm();
  }, []);

  /* ================= FETCH SATELLITE ================= */
  useEffect(() => {
    if (!farm?.latitude) return;

    axios
      .post("/api/sentinel/indices", {
        lat: farm.latitude,
        lon: farm.longitude,
      })
      .then((res) => {
        setNdvi(res.data.ndvi);
        setNdwi(res.data.ndwi);
      });
  }, [farm]);

  /* ================= FETCH WEATHER================= */
  useEffect(() => {
    if (!farm?.latitude) return;
    axios
      .get(`/api/weather?lat=${farm.latitude}&lon=${farm.longitude}`)
      .then((res) => setWeather(res.data));
  }, [farm]);

  /* ================= EXTRACT NUMBERS ================= */
  const rain7d =
    weather?.daily.precipitation_sum?.slice(-7).reduce((a, b) => a + b, 0) ?? 0; // Last 7 days rainfall

  const rain14d =
    weather?.daily.precipitation_sum?.reduce((a, b) => a + b, 0) ?? 0; // Last 14 days rainfall

  const maxTemp = weather ? Math.max(...weather.daily.temperature_2m_max) : 0; // Max temperature

  const avgHumidity = weather
    ? Math.max(...weather.daily.relative_humidity_2m_mean)
    : 0; // Avg humidity
  const windSpeed = weather
    ? Math.max(...weather.daily.wind_speed_10m_max)
    : undefined; // Max wind speed

  /* ================= AI DECISIONS ================= */
  // Vegetation Status
  const vegetation = typeof ndvi === "number" ? getVegetationStatus(ndvi) : "—";

  // Water Stress
  const waterStress =
    typeof ndwi === "number" && typeof rain14d === "number"
      ? getWaterStress({
          ndwi,
          rain14d,
          windSpeed: typeof windSpeed === "number" ? windSpeed : undefined,
        })
      : "—";

  // Leaching Risk
  const leachingRisk =
    typeof rain7d === "number" && typeof ndvi === "number"
      ? getLeachingRisk({ rain7d, ndvi })
      : "—";

  // Disease Risk
  const diseaseRisk =
    typeof avgHumidity === "number" &&
    typeof maxTemp === "number" &&
    typeof rain7d === "number" &&
    typeof ndvi === "number"
      ? getDiseaseRisk({
          humidity: avgHumidity,
          temp: maxTemp,
          rainDays:
            weather?.daily.precipitation_sum?.slice(-7).filter((r) => r >= 1)
              .length ?? 0,
          ndvi,
        })
      : "—";

  if (loading) {
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

  if (!farm) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8F8F2]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_4px_4px,rgba(25,87,51,0.15)_3px,transparent_3px)] bg-size-[36px_36px] opacity-30 pointer-events-none" />
        <div className="max-w-md w-full text-center  bg-white/80 backdrop-blur-xl  border border-[#E6EFEA] rounded-3xl shadow-xl p-8 ">
          <div className=" mx-auto mb-6 h-16 w-16 rounded-2xl  bg-linear-to-br from-[#195733] to-emerald-600  flex items-center justify-center  shadow-md">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#195733] mb-2">
            Login Required
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Crop Health insights are personalized for your farm. Please sign in
            to view satellite analysis, weather impact, and AI-based
            recommendations.
          </p>

          <div className="space-y-3">
            <Button
              size="lg"
              onClick={() => router.push("/auth/login")}
              className=" w-full py-6 text-base font-semibold rounded-xl  bg-linear-to-r from-[#195733] to-emerald-600 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg  transition-all cursor-pointer "
            >
              Login to Continue
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/")}
              className="w-full py-6 text-base font-semibold rounded-xl  border-[#195733]/30 text-[#195733]  hover:bg-[#195733]/10 cursor-pointer"
            >
              Back to Home
            </Button>
          </div>

          {/* Trust note */}
          <p className="mt-5 text-xs text-gray-500">
            Your data is secure • Used only for farming insights
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
                  <h1 className="text-3xl sm:text-4xl font-bold mt-1">
                    {vegetation}
                  </h1>

                  <p className="text-xs opacity-80 mt-1">Satellite + Weather</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs opacity-80">NDVI</p>
                    <p className="text-xl font-semibold">
                      {typeof ndvi === "number" ? ndvi.toFixed(2) : "—"}
                    </p>
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
                        {maxTemp.toFixed(1)} °C
                      </span>

                      {maxTemp > 35 ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </p>

                    <p
                      className={`text-xs sm:text-sm mt-1 ${
                        maxTemp > 35 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {maxTemp > 35
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
                  {windSpeed !== undefined && (
                    <div className="space-y-1">
                      <p className="text-gray-500">Wind Speed (Max)</p>
                      <p className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                        <span className="text-gray-800">
                          {windSpeed.toFixed(1)} km/h
                        </span>

                        {windSpeed > 25 ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </p>

                      <p
                        className={`text-xs sm:text-sm mt-1 ${
                          windSpeed > 25 ? "text-amber-600" : "text-green-600"
                        }`}
                      >
                        {windSpeed > 25
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

function Insight({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-6">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-[#195733] mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
