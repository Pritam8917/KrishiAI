import { NextResponse } from "next/server";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { MANUAL_SUGGESTIONS } from "@/lib/manual_suggestions";
import { createClient } from "@supabase/supabase-js";
import { buildPrompt } from "@/lib/prompt";

const geminiai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(req) {
  try {
    const { image_url } = await req.json();
    //image validation
    if (!image_url) {
      return NextResponse.json({ error: "image_url missing" }, { status: 400 });
    }
    // Extract path from URL
    const path = image_url.split("/crop_reports/")[1];
    if (!path) throw new Error("Invalid image_url");

    /* ---------- Download image ---------- */
    const { data, error } = await supabase.storage
      .from("crop_reports")
      .download(path);

    if (error || !data) {
      throw new Error("Supabase download failed");
    }
    // Convert to buffer for ML upload
    const buffer = await data.arrayBuffer();

    /* ---------- ML Prediction ---------- */
    const formData = new FormData();
    formData.append("image", new Blob([buffer]), "leaf.jpg");

    const mlRes = await axios.post(
      "https://krishiai-1-8ycv.onrender.com/problem",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    const { prediction, confidence } = mlRes.data;
    console.log("ML Prediction:", prediction, "Confidence:", confidence);

    /* ---------- Manual fallback ---------- */
    const manual = MANUAL_SUGGESTIONS[prediction];

    /* ---------- AI JSON response ---------- */
    let aiData = null;

    try {
      const prompt = buildPrompt({ prediction, confidence, manual });

      const response = await geminiai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const rawtext =
        response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanedText = rawtext
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      aiData = JSON.parse(cleanedText);
      console.log("AI Response (raw):", rawtext);
      console.log("AI Response parsed successfully");
    } catch (err) {
      console.warn("⚠️ AI JSON failed, using fallback:", err);
    }

    /* ---------- AI-style fallback JSON ---------- */
    if (!aiData) {
      aiData = {
        disease: prediction,
        measures: [
          manual?.advice || "Remove infected parts",
          "Maintain proper irrigation",
          "Ensure good air circulation",
        ],
        pesticides: manual?.chemicals || ["Consult local supplier"],
        advice: "Monitor crops regularly and take early action.",
        disclaimer:
          "Always consult an agricultural expert before using chemicals.",
      };
    }

    return NextResponse.json({
      predicted_disease: prediction,
      confidence,
      ai_response: aiData,
      source: "AI-generated",
    });
  } catch (error) {
    console.error("❌ API failed:", error);

    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
