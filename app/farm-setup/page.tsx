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
import { motion, type Variants } from "framer-motion";
import { toast } from "sonner";

/* ================= Animations ================= */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 25 },
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

/* ================= Types ================= */

export type Location = {
  state: string;
  district: string;
  block: string;
  village: string;
  latitude: number | null;
  longitude: number | null;
};

/* ================= Component ================= */

export default function FarmSetup() {
  const router = useRouter();

  const [farmerName, setFarmerName] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [cropInput, setCropInput] = useState({
    cropType: "",
    landSize: 0,
    landUnit: "acres" as "acres" | "hectares" | "bigha",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleLocationChange = (newLocation: Location) => {
    setLocation(newLocation);
  };

  /* ---------------- Save ---------------- */

  const handleSaveFarm = async () => {
    if (isSaving) return;

    // ---------- VALIDATIONS ----------
    if (!farmerName.trim()) {
      toast.error("Please enter farmer name");
      return;
    }

    if (!location) {
      toast.error("Please select farm location");
      return;
    }

    if (!location.state) {
      toast.error("Please select state");
      return;
    }

    if (!location.district) {
      toast.error("Please select district");
      return;
    }

    if (!location.block) {
      toast.error("Please select block");
      return;
    }

    if (!location.village) {
      toast.error("Please select village");
      return;
    }

    if (location.latitude === null || location.longitude === null) {
      toast.error("Unable to detect farm coordinates");
      return;
    }

    if (!cropInput.cropType) {
      toast.error("Please select crop type");
      return;
    }

    if (!cropInput.landSize || cropInput.landSize <= 0) {
      toast.error("Please enter valid land size");
      return;
    }

    // ---------- SAVE ----------
    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Session expired. Please login again.");
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase.from("farm_profiles").upsert(
        {
          user_id: user.id,
          farmer_name: farmerName,
          ...location,
          crop: cropInput.cropType,
          land_size: cropInput.landSize,
          land_unit: cropInput.landUnit,
        },
        { onConflict: "user_id" }
      );

      if (error) {
        toast.error("Failed to save farm details");
        return;
      }

      toast.success("Farm details saved successfully 🌱");
      router.push("/profile");
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <section className="relative py-12 md:py-16 bg-[#F8F8F2] overflow-hidden">
      {/* Background pattern */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_2px_2px,rgba(25,87,51,0.18)_2px,transparent_2px)]
          bg-size-[32px_32px]
          opacity-30
          pointer-events-none
        "
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {/* ================= HEADER ================= */}
        <motion.div
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-14 px-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="h-12 w-12 rounded-xl bg-linear-to-br from-[#195733] to-emerald-700 flex items-center justify-center shadow-md"
            >
              <Sprout className="w-6 h-6 text-white" />
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#195733]">
              Krishi<span className="text-emerald-700">AI</span>
            </h1>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Set Up Your Farm
          </h2>

          <p className="text-lg text-green-800">
            Add your farm details <b>once</b> to unlock AI-powered insights.
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Trusted agri-technology • Secure by design
          </p>
        </motion.div>

        {/* ================= FORM ================= */}
        <motion.div
          variants={stagger}
          className="max-w-4xl mx-auto space-y-6 mb-12 px-4"
        >
          {/* Farmer */}
          <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
            <Card className="border-l-4 border-[#195733] shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#195733]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#195733]" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Farmer Profile</h3>
                    <p className="text-sm text-green-800">
                      Used for reports and personalized advice
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="farmerName">Farmer Name</Label>
                  <Input
                    id="farmerName"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location */}
          <motion.div variants={fadeUp}>
            <Card className="border-l-4 border-[#195733] shadow-sm">
              <CardContent className="pt-6">
                <LocationSelector
                  location={location}
                  onLocationChange={handleLocationChange}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Crop */}
          <motion.div variants={fadeUp}>
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
          </motion.div>

          {/* ================= CTA ================= */}
          <motion.div variants={fadeUp} className="pt-4">
            <Button
              size="lg"
              onClick={handleSaveFarm}
              disabled={isSaving}
              className={cn(
                "w-full py-7 text-lg font-bold rounded-xl flex items-center justify-center gap-3",
                "bg-linear-to-br from-[#195733] to-emerald-700 text-white shadow-lg cursor-pointer",
                !isSaving && "hover:-translate-y-1 hover:shadow-xl",
                isSaving && "opacity-70 cursor-not-allowed"
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
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
