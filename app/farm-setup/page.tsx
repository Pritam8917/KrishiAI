"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Loader2, ArrowRight, Sprout, User } from "lucide-react";
import LocationSelector from "../locationselector/page";
import CropSelector from "../cropselector/page";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export default function FarmSetup() {
  const router = useRouter();

  const [farmerName, setFarmerName] = useState("");

  const [location, setLocation] = useState({
    state: "",
    district: "",
    block: "",
    village: "",
  });

  const [coordinates, setCoordinates] = useState<{
    lat: number | null;
    lon: number | null;
  }>({ lat: null, lon: null });

  const [cropInput, setCropInput] = useState({
    cropType: "",
    landSize: 0,
    landUnit: "acres" as "acres" | "hectares" | "bigha",
  });
  const [isSaving, setIsSaving] = useState(false);

  /* -------------------- VALIDATION -------------------- */
  const canSaveFarm =
    farmerName.trim() !== "" &&
    location.state !== "" &&
    location.district !== "" &&
    location.block !== "" &&
    location.village !== "" &&
    cropInput.cropType !== "" &&
    cropInput.landSize > 0 &&
    coordinates.lat !== null &&
    coordinates.lon !== null;

  /* -------------------- SAVE HANDLER -------------------- */
  const handleSaveFarm = async () => {
    if (!canSaveFarm || isSaving) return;
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Session expired. Please login again.");
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase.from("farm_profiles").upsert(
        {
          user_id: user.id,
          farmer_name: farmerName,
          state: location.state,
          district: location.district,
          block: location.block,
          village: location.village,
          latitude: coordinates.lat,
          longitude: coordinates.lon,
          crop: cropInput.cropType,
          land_size: cropInput.landSize,
          land_unit: cropInput.landUnit,
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error(error);
        alert("Failed to save farm details. Please try again.");
        return;
      }

      router.push("/crophealth");
    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <section className="relative py-12 md:py-15 bg-[#F8F8F2] overflow-hidden">
      {/* ================= HEADER ================= */}
      <div
        className="
    absolute inset-0
    bg-[radial-gradient(circle_at_2px_2px,rgba(25,87,51,0.18)_2px,transparent_2px)]
    bg-size-[32px_32px]
    opacity-30
    pointer-events-none
  "
      />
      <div className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-[#195733] to-emerald-700 flex items-center justify-center shadow-md">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#195733]">
              Krishi<span className="text-emerald-700">AI</span>
            </h1>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Set Up Your Farm
          </h2>

          <p className="text-lg text-green-800 leading-relaxed">
            Add your farm details <b>once</b> to unlock satellite-based crop
            health, weather insights, and smart farming recommendations.
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Trusted agri-technology • Data used only for farming insights
          </p>
        </div>

        {/* ================= FORM AREA ================= */}
        <div className="max-w-4xl mx-auto space-y-6 mb-12 px-4">
          {/* ---------- FARMER PROFILE ---------- */}
          <Card className="border-l-4 border-[#195733] shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#195733]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#195733]" />
                </div>
                <div>
                  <h3 className="font-semibold">Farmer Profile</h3>
                  <p className="text-sm text-green-800">
                    Used in reports, alerts, and personalized advice
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="farmerName" className="pb-1 pt-2">
                  Farmer Name
                </Label>
                <Input
                  id="farmerName"
                  placeholder="e.g. Ramesh Kumar"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  This helps us personalize recommendations
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ---------- LOCATION ---------- */}
          <Card className="border-l-4 border-[#195733] shadow-sm">
            <CardContent className="pt-6">
              <LocationSelector
                location={location}
                onLocationChange={setLocation}
                onCoordinatesFound={(lat, lon) => setCoordinates({ lat, lon })}
              />
            </CardContent>
          </Card>

          {/* ---------- CROP DETAILS ---------- */}
          <Card className="border-l-4 border-[#195733] shadow-sm">
            <CardContent className="pt-6">
              <CropSelector
                cropInput={cropInput}
                onCropInputChange={(input) =>
                  setCropInput({ ...cropInput, ...input })
                }
              />
            </CardContent>
          </Card>

          {/* ================= SAVE CTA ================= */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={handleSaveFarm}
              disabled={!canSaveFarm || isSaving}
              className={cn(
                "w-full py-7 text-lg font-bold rounded-xl flex items-center justify-center gap-3",
                "bg-linear-to-br from-[#195733] to-emerald-700 text-white",
                "transition-all shadow-lg cursor-pointer",
                !isSaving && "hover:-translate-y-1",
                (isSaving || !canSaveFarm) && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving farm details…
                </>
              ) : (
                <>
                  <Sprout className="w-5 h-5" />
                  Save & Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <p className="mt-3 text-center text-sm text-gray-500">
              You can edit these details anytime from your profile
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
