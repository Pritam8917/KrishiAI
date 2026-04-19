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
    null,
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
  const [status, setStatus] = useState("");

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

  // Compress image before upload (BIG SPEED BOOST)
  const compressImage = async (file: File): Promise<File> => {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");

    const scale = 0.5; // reduce size
    canvas.width = bitmap.width * scale;
    canvas.height = bitmap.height * scale;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob!], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.7,
      );
    });
  };

  /* ---------------- Upload ---------------- */
  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `issues/report-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("crop_reports")
      .upload(path, file);

    if (error) throw error;

    const { data } = supabase.storage.from("crop_reports").getPublicUrl(path);

    return data.publicUrl;
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async () => {
    if (!imageFile) return;

    try {
      setAnalyzing(true);
      setErrorMsg(null);

      // Compress first (faster upload)
      const compressedFile = await compressImage(imageFile);
      setStatus(" Uploading image...");
      const imageUrl = await uploadImage(compressedFile);
      setStatus("Analyzing crop disease...");

      const { data } = await axios.post("/api/current-problem", {
        image_url: imageUrl,
      });

      // save report to supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("User not authenticated");
        return;
      }

      const symptomLabels = selectedSymptoms.map(
        (id) => symptoms.find((s) => s.id === id)?.label,
      );

      const { error } = await supabase.from("crop_reports").insert([
        {
          user_id: user.id,
          symptoms: symptomLabels,
          severity: severity,
          image_url: imageUrl,
          predicted_disease: data.predicted_disease,
        },
      ]);
      if (error) {
        console.error("SUPABASE ERROR:", error.message);
        alert("Failed to save data");
      } else {
        console.log("Saved to database ✅");
      }

      const ai = data.ai_response || {};
      setAnalysisResult({
        disease: data.predicted_disease,
        confidence: data.confidence,
        suggestions: [
          ...(ai.measures || []),
          ...(ai.advice ? [ai.advice] : []),
        ],
        chemicals: ai.pesticides || [],
        source: data.source || "Expert-curated",
      });

      setStatus("Done ✅");
    } catch (err) {
      console.error(err);
      setErrorMsg("AI analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((p) =>
      p.includes(id) ? p.filter((s) => s !== id) : [...p, id],
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
                        : "bg-white border-[#E6EFEA]",
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
                      severity === s ? "bg-[#195733] text-white" : "bg-white",
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
            <Button
              disabled={!canSubmit || analyzing || uploading}
              onClick={handleSubmit}
              className={cn(
                "w-full py-6 text-lg font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-300",
                canSubmit
                  ? "bg-linear-to-r from-[#195733] to-[#2FA36B] text-white shadow-lg hover:shadow-xl cursor-pointer"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed",
              )}
            >
              {analyzing ? (
                <>
                  <span className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 animate-spin" />
                    {status || "Analyzing..."}
                  </span>
                </>
              ) : (
                <>
                  Analyze Disease <ArrowRight />
                </>
              )}
            </Button>

            {errorMsg && (
              <p className="text-center text-sm text-red-600">{errorMsg}</p>
            )}

            {analyzing && (
              <div className="mt-10 space-y-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-20 bg-gray-200 rounded-xl" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            )}
            {/* ---------------- RESULT ---------------- */}
            {analysisResult && (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="
      relative mt-14 p-6 sm:p-8
      rounded-3xl
      bg-white/80 backdrop-blur-xl
      border border-[#E6EFEA]
      shadow-[0_20px_60px_-20px_rgba(25,87,51,0.35)]
      space-y-6
      overflow-hidden
    "
              >
                {/* Soft glow */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#2FA36B]/15 rounded-full blur-3xl pointer-events-none" />

                {/* ---------- Header ---------- */}
                <motion.div
                  variants={fadeItem}
                  className="flex items-center justify-between gap-4 flex-wrap"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-[#195733]">
                    🌱 AI Diagnosis Result
                  </h2>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
          ${
            analysisResult.source === "AI-generated"
              ? "bg-[#195733]/10 text-[#195733]"
              : "bg-blue-100 text-blue-700"
          }`}
                  >
                    {analysisResult.source === "AI-generated"
                      ? "AI Generated"
                      : "Expert Curated"}
                  </span>
                </motion.div>

                {/* ---------- Disease Card ---------- */}
                <motion.div
                  variants={fadeItem}
                  className="
        rounded-2xl border border-[#E6EFEA] bg-white
        p-5 sm:p-6
        shadow-sm
      "
                >
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Detected Problem
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-[#195733]/10 text-xl">
                      🌿
                    </div>

                    <div>
                      <p className="text-lg font-semibold text-[#195733] capitalize">
                        {analysisResult.disease.replaceAll("_", " ")}
                      </p>
                      <p className="text-xs text-gray-500">
                        Based on image analysis
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* ---------- Confidence ---------- */}
                <motion.div variants={fadeItem} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-[#195733]">
                      Confidence Level
                    </span>
                    <span className="font-semibold text-[#195733]">
                      {analysisResult.confidence.toFixed(2)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysisResult.confidence}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-linear-to-r from-[#195733] to-[#2FA36B]"
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    AI confidence based on crop condition
                  </p>
                </motion.div>

                {/* ---------- Suggestions ---------- */}
                <motion.div
                  variants={fadeItem}
                  className="rounded-2xl border border-[#E6EFEA] bg-white p-5 sm:p-6"
                >
                  <h4 className="font-semibold text-[#195733] mb-3">
                    Recommended Actions
                  </h4>

                  <ul className="space-y-2 text-sm text-gray-700">
                    {(Array.isArray(analysisResult.suggestions)
                      ? analysisResult.suggestions
                      : [analysisResult.suggestions]
                    ).map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#195733]" />
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* ---------- Chemicals ---------- */}
                {analysisResult.chemicals.length > 0 && (
                  <motion.div variants={fadeItem}>
                    <h4 className="font-semibold text-[#195733] mb-2">
                      Recommended Medicines
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {analysisResult.chemicals.map((c, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-[#195733]/10 text-[#195733] border border-[#195733]/20"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ---------- Disclaimer ---------- */}
                <motion.div
                  variants={fadeItem}
                  className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3"
                >
                  <span>⚠️</span>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    This is AI-generated advice. Consult agricultural experts
                    before using any chemicals.
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
