import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const geminiai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;

    const result = await geminiai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
      You are KrishiAI, a smart AI assistant for Indian farmers.

      Your goal is to provide practical and easy-to-understand farming advice.

      Rules:
      - Answer only agriculture-related questions
      - Use simple farmer-friendly English
      - Keep responses concise
      - Give practical Indian farming advice
      - Use short sentences
      - Return clean plain text only
      - Do not use markdown
      - Do not use hashtags
      - Do not use bold text
      - Avoid symbols like *, #, **
      - Format advice in numbered points whenever possible during fertilizer, pest control, or general farming tips
      - Keep answers mobile-friendly
      - Maximum 5 points

      Good Response Example:
        1. Use balanced fertilizer.
        2. Avoid excessive watering.
        3. Monitor leaf color regularly.

      Bad Example:
        # Farming Tips
        * Use fertilizer

      User Question:
      ${message}
      `,
    });

    const cleanText = result.text?.replace(/[#*`]/g, "")?.trim();

    return NextResponse.json({
      success: true,
      reply: cleanText,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      success: false,
      reply: "Something went wrong",
    });
  }
}
