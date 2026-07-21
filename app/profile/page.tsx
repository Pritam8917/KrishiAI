"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  User,
  MapPin,
  Leaf,
  Ruler,
  Edit,
  Sprout,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "../navbar/page";
import { motion, type Variants } from "framer-motion";

/* ================= Animations ================= */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const stagger: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};
type Prediction = {
  predicted_yield: number;
  potential_after_improvement: number;
  created_at?: string;
};

type CropReport = {
  predicted_disease: string;
  confidence?: number;
  created_at?: string;
  severity?: string;
};
/* ================= Component ================= */

export default function ProfilePage() {
  const router = useRouter();

  type FarmProfile = {
    farmer_name?: string;
    village?: string;
    block?: string;
    district?: string;
    state?: string;
    crop?: string;
    land_size?: number;
    land_unit?: string;
  };

  const [farm, setFarm] = useState<FarmProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastPrediction, setLastPrediction] = useState<Prediction | null>(null);
  const [lastDisease, setLastDisease] = useState<CropReport | null>(null);
  //date formatting function
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    // Fetches the most recent disease report for the user
    const fetchLastDisease = async (userId: string) => {
      const { data, error } = await supabase
        .from("crop_reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error) {
        setLastDisease(data);
      } else {
        console.error("Disease fetch error:", error.message);
      }
    };

    // Fetches the most recent yield prediction for the user
    const fetchLastPrediction = async (userId: string) => {
      const { data, error } = await supabase
        .from("yield_predictions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error) {
        setLastPrediction(data);
      } else {
        console.error("Prediction fetch error:", error.message);
      }
    };

    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("farm_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error) setFarm(data);

      await fetchLastPrediction(user.id);
      await fetchLastDisease(user.id);
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#F8F8F2] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_4px_4px,rgba(25,87,51,0.15)_3px,transparent_3px)] bg-size-[36px_36px] opacity-30 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex flex-col items-center gap-4 text-center"
        >
          <Sprout className="w-12 h-12 text-[#195733] animate-pulse" />
          <p className="text-xl font-medium text-[#195733]">
            Preparing your farm details…
          </p>
        </motion.div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div
          className="max-w-md w-full text-center bg-white/80 backdrop-blur-xl 
                  border border-[#E6EFEA] rounded-2xl shadow-lg p-8"
        >
          {/* Icon */}
          <div
            className="mx-auto mb-6 h-16 w-16 rounded-2xl 
                    bg-linear-to-br from-[#195733] to-emerald-600 
                    flex items-center justify-center shadow-md"
          >
            <Sprout className="w-8 h-8 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-[#195733] mb-2">
            Farm Profile Not Found
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            You haven’t set up your farm details yet. Add your farm once to
            unlock crop health monitoring, weather insights, and AI-powered
            recommendations.
          </p>

          {/* CTA */}
          <Button
            size="lg"
            onClick={() => router.push("/farm-setup")}
            className="w-full py-6 text-base font-semibold rounded-xl bg-linear-to-r from-[#195733] to-emerald-600  text-white shadow-md  hover:-translate-y-0.5 hover:shadow-lg  transition-all cursor-pointer"
          >
            🌱 Set Up My Farm
          </Button>

          {/* Footer hint */}
          <p className="mt-4 text-xs text-gray-500">
            Takes less than 2 minutes • Secure & editable anytime
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen bg-[#F8F8F2]">
      <Header />

      <div className="relative z-10 py-20 px-4">
        {/* ================= PAGE HEADER ================= */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#195733] pt-10">
            Your Farm Profile
          </h1>

          <div className="flex justify-center mt-4">
            <div className="h-1 w-24 rounded-full bg-linear-to-r from-[#195733] to-emerald-600" />
          </div>

          <p className="mt-4 text-lg text-green-800">
            View and manage your personal, farm, and crop information
          </p>

          <p className="mt-1 text-sm text-gray-600">
            Used for crop health monitoring, weather alerts, and AI-based
            insights
          </p>
        </motion.div>

        {/* ================= PROFILE CARDS ================= */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Farmer */}
          <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
            <Card className="border-l-4 border-[#195733] shadow-sm">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#195733]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#195733]" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Farmer Information</h3>
                    <p className="text-sm text-green-800">
                      Personal identification details
                    </p>
                  </div>
                </div>

                <p className="text-lg font-semibold text-gray-800">
                  {farm.farmer_name}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location */}
          <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
            <Card className="border-l-4 border-[#195733] shadow-sm">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#195733]" />
                  <h3 className="font-semibold">Farm Location</h3>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {/* {farm.village}, {farm.block}, <br /> */}
                  {farm.district}, {farm.state}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Crop */}
          <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
            <Card className="border-l-4 border-[#195733] shadow-sm">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-[#195733]" />
                  <h3 className="font-semibold">Crop Details</h3>
                </div>

                <p className="text-sm text-gray-700">
                  Crop: <b>{farm.crop}</b>
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Ruler className="w-4 h-4" />
                  {farm.land_size} {farm.land_unit}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ================= LAST PREDICTION ================= */}
          <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
            {lastPrediction ? (
              <Card className="border-l-4 border-emerald-600 shadow-sm bg-white/90 backdrop-blur">
                <CardContent className="pt-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Sprout className="w-5 h-5 text-emerald-600" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#195733]">
                          Last Yield Prediction
                        </h3>
                        <p className="text-xs text-gray-500">
                          Based on latest AI analysis
                        </p>
                      </div>
                    </div>
                    <p className="flex items-center justify-end gap-2 text-xs text-gray-700">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                      </span>
                      {formatDate(lastPrediction.created_at)}
                    </p>
                  </div>

                  {/* Data Section */}
                  <div>
                    {/* Predicted */}
                    <div className="p-4 rounded-xl bg-[#F4FBF7] border border-emerald-100 text-center">
                      <p className="text-xs text-gray-500 mb-1">
                        Predicted Yield
                      </p>
                      <p className="text-xl font-bold text-[#195733]">
                        {lastPrediction.predicted_yield}
                      </p>
                      <p className="text-xs text-gray-500">tons/hectare</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-dashed border-gray-300 bg-white/70 backdrop-blur">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="text-3xl">🌱</div>
                  <h3 className="font-semibold text-gray-700">
                    No Prediction Yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Run your first AI prediction to see results here.
                  </p>

                  <Button
                    onClick={() => router.push("/start-prediction")}
                    className="bg-[#195733] text-white hover:bg-[#144427] cursor-pointer transition-all shadow-md  "
                  >
                    Run Prediction
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* ================= LAST DISEASE =================*/}
          <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
            {lastDisease ? (
              <Card className="border-l-4 border-red-500 shadow-sm bg-white/90 backdrop-blur">
                <CardContent className="pt-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                        🌿
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#195733]">
                          Last Disease Detection
                        </h3>
                        <p className="text-xs text-gray-500">
                          Based on image analysis
                        </p>
                      </div>
                    </div>

                    <p className="flex items-center justify-end gap-2 text-xs text-gray-700">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                      </span>
                      {formatDate(lastDisease.created_at)}
                    </p>
                  </div>

                  {/* Disease */}
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-xs text-gray-500 mb-1">
                      Detected Disease
                    </p>
                    <p className="text-md font-bold text-red-600 capitalize">
                      {lastDisease.predicted_disease.replaceAll("_", " ")}
                    </p>
                  </div>
                  {typeof lastDisease.confidence === "number" && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Confidence</p>
                        <p className="text-sm font-semibold text-emerald-700">
                          {lastDisease.confidence}%
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all"
                          style={{ width: `${lastDisease.confidence}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {/* Severity */}
                  {lastDisease.severity && (
                    <div className="text-sm text-gray-600">
                      Severity:{" "}
                      <b className="capitalize text-[#195733]">
                        {lastDisease.severity}
                      </b>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-dashed border-gray-300 bg-white/70 backdrop-blur">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="text-3xl">🧪</div>
                  <h3 className="font-semibold text-gray-700">
                    No Disease Report Yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Analyze a crop image to detect disease.
                  </p>

                  <Button
                    onClick={() => router.push("/report-problem")}
                    className="bg-[#195733] text-white hover:bg-[#144427]"
                  >
                    Diagnose Crop
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* ================= ACTIONS ================= */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col md:flex-row gap-4 pt-6"
          >
            <Button
              className="flex items-center gap-2 bg-[#195733] text-white hover:bg-[#144427] transition-all shadow cursor-pointer"
              onClick={() => router.push("/farm-setup")}
            >
              <Edit className="w-4 h-4" />
              Edit Farm Details
            </Button>

            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
            >
              Logout
            </Button>
          </motion.div>

          <p className="text-center text-xs text-gray-500 pt-6">
            KrishiAI securely stores your data and uses it only for agricultural
            insights.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
