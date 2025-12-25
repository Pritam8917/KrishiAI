"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  AlertTriangle,
  Leaf,
  Bug,
  Droplets,
  ThermometerSun,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";

import Header from "@/app/navbar/page";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ================= Animations ================= */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

const softFade: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

/* ================= Symptoms ================= */
const symptoms = [
  { id: "leaf", label: "Leaf color change", icon: Leaf },
  { id: "pest", label: "Pest attack", icon: Bug },
  { id: "wilting", label: "Wilting / Drying", icon: Droplets },
  { id: "heat", label: "Heat stress", icon: ThermometerSun },
];

export default function ReportAProblem() {
  const router = useRouter();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | null>(
    null
  );
  const [description, setDescription] = useState("");

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const canSubmit = selectedSymptoms.length > 0 && severity !== null;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F8F2] pt-24 sm:pt-28 pb-24 px-3 sm:px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          {/* ================= HEADER ================= */}
          <div className="text-center mb-10 sm:mb-12 px-2">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#195733]">
              Report a Crop Problem
            </h1>

            <p className="mt-3 text-gray-700 text-sm sm:text-base">
              Describe what you see in your field. Our AI combines satellite,
              weather & crop science to guide you.
            </p>
          </div>

          {/* ================= FORM CARD ================= */}
          <Card className="rounded-3xl shadow-xl border border-[#E6EFEA]">
            <CardContent className="p-5 sm:p-8 space-y-8">
              {/* -------- Symptoms -------- */}
              <div>
                <h3 className="font-semibold mb-3 text-[#195733]">
                  What problem are you noticing?
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {symptoms.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggleSymptom(s.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all",
                        selectedSymptoms.includes(s.id)
                          ? "bg-[#195733] text-white border-[#195733]"
                          : "bg-white hover:bg-[#195733]/5 border-[#E6EFEA]"
                      )}
                    >
                      <s.icon className="w-5 h-5" />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* -------- Severity -------- */}
              <div>
                <h3 className="font-semibold mb-3 text-[#195733]">
                  How severe is the problem?
                </h3>

                <div className="flex flex-wrap gap-3">
                  {[
                    { id: "low", label: "Low" },
                    { id: "medium", label: "Medium" },
                    { id: "high", label: "High" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() =>
                        setSeverity(s.id as "low" | "medium" | "high")
                      }
                      className={cn(
                        "px-6 py-2 rounded-full text-sm font-medium border transition-all",
                        severity === s.id
                          ? s.id === "high"
                            ? "bg-red-600 text-white border-red-600"
                            : s.id === "medium"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-green-600 text-white border-green-600"
                          : "bg-white border-[#E6EFEA] hover:bg-black/5"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* -------- Description -------- */}
              <div>
                <h3 className="font-semibold mb-2 text-[#195733]">
                  Describe the issue (optional)
                </h3>

                <Textarea
                  rows={4}
                  placeholder="Yellow spots on leaves, slow growth in one area…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* -------- Image Upload -------- */}
              <div>
                <h3 className="font-semibold mb-2 text-[#195733]">
                  Upload photo
                </h3>

                <div className="border-2 border-dashed border-[#DDE9E2] rounded-xl p-6 text-center text-sm text-gray-600">
                  <ImageIcon className="mx-auto mb-2 w-6 h-6" />
                  Image upload coming soon
                </div>
              </div>

              {/* -------- AI INFO -------- */}
              <motion.div
                variants={softFade}
                initial="hidden"
                animate="visible"
                className="rounded-2xl bg-linear-to-br from-[#F4FAF6] to-white border border-[#DDE9E2] p-5"
              >
                <h4 className="text-sm font-semibold text-[#195733] mb-2">
                  What our AI will analyze
                </h4>

                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Symptoms & severity</li>
                  <li>• Satellite vegetation health</li>
                  <li>• Weather & moisture patterns</li>
                  <li>• Crop-specific disease models</li>
                </ul>
              </motion.div>

              {/* -------- CTA -------- */}
              <motion.div whileHover={{ scale: canSubmit ? 1.02 : 1 }}>
                <Button
                  disabled={!canSubmit}
                  onClick={() => router.push("/crophealth")}
                  className={cn(
                    "w-full py-6 text-base sm:text-lg font-semibold rounded-xl flex items-center justify-center gap-2",
                    canSubmit
                      ? "bg-[#195733] hover:bg-[#144a2b] text-white shadow-lg"
                      : "bg-gray-300 cursor-not-allowed"
                  )}
                >
                  Get AI Analysis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>

              <p className="text-xs text-gray-500 text-center">
                AI analysis usually takes 2–5 minutes
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </>
  );
}
