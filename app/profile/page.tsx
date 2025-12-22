"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { User, MapPin, Leaf, Ruler, Edit, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "../navbar/page";

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

  useEffect(() => {
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
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#F8F8F2] overflow-hidden">
        {/* Dotted background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_4px_4px,rgba(25,87,51,0.15)_3px,transparent_3px)] bg-size-[36px_36px] opacity-30 pointer-events-none" />

        {/* Loader content */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 flex items-center justify-center">
            <Sprout className="w-12 h-12 text-[#195733] animate-pulse" />
          </div>

          <p className="text-xl font-medium text-[#195733]">
            Preparing your farm details…
          </p>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="text-center mt-20">
        <p>No farm profile found</p>
        <Button onClick={() => router.push("/farm-setup")}>Set up farm</Button>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen bg-[#F8F8F2]">
      {/* Navbar */}
      <Header />

      {/* Big dotted classic background */}
      <div className=" absolute inset-0 bg-[#F8F8F2]" />

      {/* Page content */}
      <div className="relative z-10 py-20 px-4">
        {/* ================= PAGE HEADER ================= */}
        <div className="text-center max-w-3xl mx-auto mb-12">
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
        </div>

        {/* ================= PROFILE CARDS ================= */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* -------- FARMER PROFILE -------- */}
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

          {/* -------- LOCATION -------- */}
          <Card className="border-l-4 border-[#195733] shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#195733]" />
                <h3 className="font-semibold">Farm Location</h3>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">
                {farm.village}, {farm.block}, <br />
                {farm.district}, {farm.state}
              </p>
            </CardContent>
          </Card>

          {/* -------- CROP DETAILS -------- */}
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

          {/* ================= ACTIONS ================= */}
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <Button
              className="
            flex items-center gap-2
            bg-[#195733]
            text-white
            hover:bg-[#144427]
            transition-all
            shadow cursor-pointer
          "
              onClick={() => router.push("/farm-setup")}
            >
              <Edit className="w-4 h-4" />
              Edit Farm Details
            </Button>

            <Button
              variant="outline"
              className="
            border-red-300
            text-red-600
            hover:bg-red-50 cursor-pointer
            flex items-center gap-2
          "
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
            >
              Logout
            </Button>
          </div>

          {/* ================= FOOTER NOTE ================= */}
          <p className="text-center text-xm text-gray-500 pt-6">
            KrishiAI securely stores your data and uses it only for agricultural
            insights.
          </p>
        </div>
      </div>
    </section>
  );
}
