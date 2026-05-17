import { NextResponse } from "next/server";
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
    const res = await geminiai.models.list();

    if (Array.isArray(res.models)) {
      res.models.forEach((m) => {
        console.log(m.name, m.supportedGenerationMethods);
      });
    }
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

    // Convert to buffer for image upload
    const buffer = await data.arrayBuffer();

    /* ---------- Disease Prediction ---------- */
    // Convert buffer → base64
    const base64Image = Buffer.from(buffer).toString("base64");

    // Prompt for structured JSON
    const visionPrompt = `
    You are an expert agricultural AI.

    Analyze the plant leaf image and return ONLY valid JSON:
    Tasks:
    - Detect if the leaf is healthy or diseased
    - Predict the disease name
    - Provide confidence (0–100)

    Output format (STRICT JSON ONLY):
    {
    "disease": "string",
    "confidence": number
    }

    Rules:
    - No extra text outside JSON
    - If uncertain, return "Unknown Disease"
    - Keep treatment short and practical
    `;

    // Call Gemini for vision analysis
    const geminiRes = await geminiai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: visionPrompt },
            {
              inlineData: {
                mimeType: data.type || "image/jpeg", // or detect dynamically
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    // Extract response
    const rawText = geminiRes?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    // Parse safely
    let prediction = "Unknown Disease";
    let confidence = 0;

    try {
      const parsed = JSON.parse(cleaned);
      prediction = parsed.disease || prediction;
      confidence =
        typeof parsed.confidence === "number" ? parsed.confidence : confidence;
    } catch (err) {
      console.warn("⚠️ Gemini JSON parse failed:", err);
    }
    console.log("ML Prediction:", prediction, "Confidence:", confidence);

    /* ---------- Manual fallback ---------- */
    const manual = MANUAL_SUGGESTIONS[prediction];

    /* ---------- AI JSON response ---------- */
    let aiData = null;

    try {
      const prompt = buildPrompt({ prediction, confidence, manual });
      
      // Call Gemini for structured advice
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
