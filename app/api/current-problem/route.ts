import { NextResponse } from "next/server";
import axios from "axios";
export async function POST(req: Request) {
  const { image_url } = await req.json(); // Extract image_url from request body

  if (!image_url) {
    return NextResponse.json(
      { error: "image_url missing" },
      { status: 400 }
    );
  }

  // Fetch image from Supabase URL
  const imgRes = await fetch(image_url);
  const buffer = await imgRes.arrayBuffer();

  // Convert to FormData
  const formData = new FormData();
  const blob = new Blob([buffer]);
  formData.append("image", blob, "leaf.jpg");

  // Call FastAPI
  const mlRes = await axios.post("http://localhost:8000/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const mlData = mlRes.data;

  return NextResponse.json({
    predicted_disease: mlData.prediction,
  });
}
