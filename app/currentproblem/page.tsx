"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Leaf,
  Bug,
  Droplets,
  ThermometerSun,
  Image as ImageIcon,
  ArrowRight,
  Sprout,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/app/navbar/page";
import { CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { supabase } from "@/lib/supabase/client";

/* ---------------- Animations ---------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/* ---------------- Data ---------------- */

const symptoms = [
  { id: "leaf", label: "Leaf color change", icon: Leaf },
  { id: "pest", label: "Pest attack", icon: Bug },
  { id: "wilting", label: "Wilting / Drying", icon: Droplets },
  { id: "heat", label: "Heat stress", icon: ThermometerSun },
];

const Step = ({ n, title }: { n: number; title: string }) => (
  <div className="flex items-center gap-3 mb-3">
    <span className="h-7 w-7 rounded-full bg-[#195733] text-white text-sm flex items-center justify-center">
      {n}
    </span>
    <h3 className="font-semibold text-[#195733]">{title}</h3>
  </div>
);

export default function ReportProblemPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | null>(
    null
  );
  // const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<null | {
    disease: string;
    confidence: number;
    suggestions: string[] | string;
    chemicals: string[];
    source: string;
  }>(null);

  /* ---------------- Auth ---------------- */

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth/login");
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router]);
  /* ---------------- Cleanup ---------------- */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* ---------------- Upload ---------------- */

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `issues/report-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("crop_reports")
      .upload(path, file);

    if (error) throw error;

    const { data } = supabase.storage.from("crop_reports").getPublicUrl(path);

    setUploading(false);
    return data.publicUrl;
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async () => {
    try {
      setAnalyzing(true);
      setErrorMsg(null);

      if (!imageFile) throw new Error("No image selected");

      const imageUrl = await uploadImage(imageFile);

      const { data } = await axios.post("/api/current-problem", {
        image_url: imageUrl,
      });

      setAnalysisResult({
        disease: data.predicted_disease,
        confidence: data.confidence,
        suggestions: data.suggestions,
        chemicals: data.recommended_chemicals,
        source: data.source,
      });
    } catch (err) {
      console.error(err);
      setErrorMsg("AI analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((p) =>
      p.includes(id) ? p.filter((s) => s !== id) : [...p, id]
    );
  };

  const canSubmit = selectedSymptoms.length > 0 && severity && imageFile;

  if (checkingAuth) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#F8F8F2] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_4px_4px,rgba(25,87,51,0.15)_3px,transparent_3px)] bg-size-[36px_36px] opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 flex items-center justify-center">
            <Sprout className="w-12 h-12 text-[#195733] animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-[#195733]">
            Loading Report a Problem
          </h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F8F2] pt-24 pb-24 px-4">
        {/* ---------------- HERO ---------------- */}
        <section className="text-center mb-16">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-[#195733]/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-[#195733]" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#195733]">
              AI Crop Diagnosis
            </h1>

            <p className="mt-3 text-gray-700 max-w-xl mx-auto">
              Report visible crop issues and let our AI analyze disease risk,
              stress patterns, and expert remedies.
            </p>
          </motion.div>
        </section>

        {/* ---------------- FORM ---------------- */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="
            max-w-3xl mx-auto
            bg-white/70 backdrop-blur-xl
            rounded-3xl shadow-2xl
            border border-[#E6EFEA]
          "
        >
          <CardContent className="p-6 sm:p-10 space-y-10">
            {/* Step 1 */}
            <div>
              <Step n={1} title="Select visible symptoms" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {symptoms.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSymptom(s.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm",
                      selectedSymptoms.includes(s.id)
                        ? "bg-[#195733] text-white"
                        : "bg-white border-[#E6EFEA]"
                    )}
                  >
                    <s.icon className="w-5 h-5" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <Step n={2} title="Severity level" />
              <div className="flex gap-3 flex-wrap">
                {["low", "medium", "high"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s as "low" | "medium" | "high")}
                    className={cn(
                      "px-6 py-2 rounded-full text-sm border",
                      severity === s ? "bg-[#195733] text-white" : "bg-white"
                    )}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <Step n={3} title="Upload crop image" />

              {!previewUrl ? (
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className="
                      flex flex-col items-center justify-center p-8
                      border-2 border-dashed border-[#DDE9E2]
                      rounded-2xl cursor-pointer
                      bg-[#F8F8F2]
                      text-center
                    "
                >
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageFile(file);
                      setPreviewUrl(URL.createObjectURL(file)); //instantly preview user-selected images in memory before uploading, without uploading to server
                    }}
                  />

                  <ImageIcon className="w-8 h-8 mb-2 text-[#195733]" />
                  <p className="text-sm text-[#195733] font-medium">
                    Upload clear leaf image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG / PNG • Good lighting preferred
                  </p>
                </motion.label>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className=" relative rounded-2xl overflow-hidden  border border-[#E6EFEA] bg-white"
                >
                  {/* Image Preview */}
                  <Image
                    src={previewUrl}
                    alt="Selected crop"
                    width={100}
                    height={100}
                    className="w-full h-56 object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/10" />

                  {/* Change Button */}
                  <label className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-[#195733]  cursor-pointer shadow  hover:bg-white">
                    Change image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImageFile(file);
                        setPreviewUrl(URL.createObjectURL(file)); //instantly preview user-selected images in memory before uploading, without uploading to server
                      }}
                    />
                  </label>
                </motion.div>
              )}
            </div>

            {/* CTA */}
            <motion.div
              whileHover={!analyzing && canSubmit ? { scale: 1.03 } : {}}
              whileTap={!analyzing && canSubmit ? { scale: 0.97 } : {}}
            >
              <Button
                disabled={!canSubmit || analyzing || uploading}
                onClick={handleSubmit}
                className={cn(
                  `w-full py-6 text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300`,
                  canSubmit
                    ? "bg-linear-to-r from-[#195733] to-[#2FA36B] text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                )}
              >
                {analyzing ? (
                  <span className="flex items-center gap-3">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <Sprout className="w-5 h-5" />
                    </motion.span>
                    AI Analyzing...
                  </span>
                ) : (
                  <>
                    Get AI Diagnosis
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>

            {errorMsg && (
              <p className="text-center text-sm text-red-600">{errorMsg}</p>
            )}

            {/* ---------------- RESULT ---------------- */}
            {analysisResult && (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="
                relative mt-14 p-8 sm:p-10
                 rounded-3xl
                bg-white/70 backdrop-blur-xl
                  border border-[#E6EFEA]
                  shadow-[0_20px_60px_-20px_rgba(25,87,51,0.35)]
                  space-y-8
                  overflow-hidden
                "
              >
                {/* Soft glow */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#2FA36B]/15 rounded-full blur-3xl pointer-events-none" />

                {/* ---------- Header ---------- */}
                <motion.div
                  variants={fadeItem}
                  className="flex items-center justify-between flex-wrap gap-4"
                >
                  <h2 className="text-2xl font-bold text-[#195733] flex items-center gap-2">
                    🌱 AI Diagnosis Result
                  </h2>

                  {/* Source badge */}
                  <span
                    className={`
          px-4 py-1.5 rounded-full text-xs font-semibold
          ${
            analysisResult.source === "AI-generated"
              ? "bg-[#195733]/10 text-[#195733]"
              : "bg-blue-100 text-blue-700"
          }
        `}
                  >
                    {analysisResult.source === "AI-generated"
                      ? "AI Generated"
                      : "Expert Curated"}
                  </span>
                </motion.div>

                {/* ---------- Disease Card ---------- */}
                <motion.div
                  variants={fadeItem}
                  className="rounded-2xl border border-[#E6EFEA] bg-white p-5"
                >
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-[#195733]">
                      Detected Disease
                    </span>
                  </p>
                  <p className="mt-1 text-base font-medium capitalize text-gray-900">
                    {analysisResult.disease.replaceAll("_", " ")}
                  </p>
                </motion.div>

                {/* ---------- Confidence ---------- */}
                <motion.div variants={fadeItem}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#195733]">
                      Confidence Level
                    </span>
                    <span className="text-sm font-bold text-[#195733]">
                      {analysisResult.confidence.toFixed(2)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysisResult.confidence}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-3 rounded-full bg-linear-to-r from-[#195733] to-[#2FA36B]"
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Based on model prediction confidence and symptom correlation
                  </p>
                </motion.div>

                {/* ---------- Suggestions ---------- */}
                <motion.div
                  variants={fadeItem}
                  className="rounded-2xl border border-[#E6EFEA] bg-white p-6"
                >
                  <h4 className="font-semibold text-[#195733] mb-3 flex items-center gap-2">
                    🌾 Suggested Actions
                  </h4>

                  <ul className="space-y-2 text-sm text-gray-700">
                    {(Array.isArray(analysisResult.suggestions)
                      ? analysisResult.suggestions
                      : [analysisResult.suggestions]
                    ).map((s, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.08 }}
                        className="flex items-start gap-2"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#195733]" />
                        <span>{s}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* ---------- Chemicals ---------- */}
                {analysisResult.chemicals.length > 0 && (
                  <motion.div variants={fadeItem}>
                    <h4 className="font-semibold text-[#195733] mb-3 flex items-center gap-2">
                      💊 Recommended Chemicals (Advisory)
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {analysisResult.chemicals.map((c, i) => (
                        <motion.span
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className="
                px-4 py-1.5 rounded-full text-xs font-medium
                bg-[#195733]/10 text-[#195733]
                border border-[#195733]/20
              "
                        >
                          {c}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ---------- Disclaimer ---------- */}
                <motion.div
                  variants={fadeItem}
                  className="
        flex items-start gap-3
        bg-amber-50 border border-amber-200
        rounded-2xl p-4
      "
                >
                  <span className="text-lg">⚠️</span>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    This recommendation is generated using AI and historical
                    agricultural data. Always consult certified agricultural
                    officers before applying chemical treatments.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </CardContent>
        </motion.div>
      </main>
    </>
  );
}
