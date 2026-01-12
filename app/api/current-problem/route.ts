import { NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";
import { MANUAL_SUGGESTIONS } from "@/lib/manual_suggestions";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { image_url } = await req.json(); // Extract image_url from request body

  if (!image_url) {
    return NextResponse.json({ error: "image_url missing" }, { status: 400 });
  }

  // Fetch image from Supabase URL
  const imgRes = await fetch(image_url);
  const buffer = await imgRes.arrayBuffer();

  // Convert to FormData
  const formData = new FormData();
  const blob = new Blob([buffer]);
  formData.append("image", blob, "leaf.jpg");

  // Call FastAPI / Integration of Nextjs server with Fastapi server
  const mlRes = await axios.post("http://localhost:8000/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const { prediction, confidence } = mlRes.data;

  /* -------- OpenAI suggestions (PRIMARY) -------- */
  let aiSuggestions: string | null = null;
  try {
    const prompt = ` A plant disease has been detected.
                     Disease: ${prediction}
                     Confidence: ${confidence}%
                      Provide:
                            - General control measures
                            - Common pesticide names (NO dosage)
                            - Short farmer-friendly advice
                              Add a safety disclaimer.
                      Respond in a concise manner. `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    aiSuggestions = aiRes.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI failed, using manual fallback", error);
  }

  /* -------- Manual fallback -------- */
  const manual = MANUAL_SUGGESTIONS[prediction];
  return NextResponse.json({
    predicted_disease: prediction,
    confidence,
    suggestions: aiSuggestions ??
      manual?.advice ?? ["Consult local agricultural expert"],
    recommended_chemicals: manual?.chemicals ?? [],
    disease_type: manual?.disease_type ?? "Unknown",
    warning:
      manual?.warning ??
      "This is advisory only. Consult agricultural officers.",
    source: aiSuggestions ? "AI-generated" : "Expert-curated",
  });
}
