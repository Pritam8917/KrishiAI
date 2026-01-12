import { NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";
import { MANUAL_SUGGESTIONS } from "@/lib/manual_suggestions";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

export async function POST(req: Request) {
  try {
    const { image_url } = await req.json();

    if (!image_url) {
      return NextResponse.json({ error: "image_url missing" }, { status: 400 });
    }

    // Extract path after bucket name
    const path = image_url.split("/crop_reports/")[1];
    if (!path) throw new Error("Invalid image_url");

    /* ---------- Download image from Supabase (CORRECT) ---------- */
    const { data, error } = await supabase.storage
      .from("crop_reports")
      .download(path);

    if (error || !data) {
      throw new Error("Supabase download failed");
    }

    const buffer = await data.arrayBuffer();

    /* ---------- Send to FastAPI ---------- */
    const formData = new FormData();
    formData.append("image", new Blob([buffer]), "leaf.jpg");

    const mlRes = await axios.post("http://127.0.0.1:8000/predict", formData);

    const { prediction, confidence } = mlRes.data;

    /* ---------- OpenAI suggestions ---------- */
    let aiSuggestions: string | null = null;

    try {
      const prompt = `
A plant disease has been detected.

Disease: ${prediction}
Confidence: ${confidence}%

Provide:
- General control measures
- Common pesticide names (NO dosage)
- Short farmer-friendly advice
- Add a safety disclaimer
`;

      const aiRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      aiSuggestions = aiRes.choices[0].message.content;
    } catch (err) {
      console.warn("⚠️ OpenAI failed, using manual fallback", err);
    }

    /* ---------- Manual fallback ---------- */
    const manual = MANUAL_SUGGESTIONS[prediction];

    return NextResponse.json({
      predicted_disease: prediction,
      confidence,
      suggestions: aiSuggestions ??
        manual?.advice ?? ["Consult a local agricultural expert"],
      recommended_chemicals: manual?.chemicals ?? [],
      disease_type: manual?.disease_type ?? "Unknown",
      warning:
        manual?.warning ??
        "This is advisory only. Consult agricultural officers.",
      source: aiSuggestions ? "AI-generated" : "Expert-curated",
    });
  } catch (error) {
    console.error("❌ current-problem API failed:", error);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
