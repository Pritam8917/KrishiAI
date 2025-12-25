import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    // ✅ Validate inputs
    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const latitude = Number(lat);
    const longitude = Number(lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude" },
        { status: 400 }
      );
    }

    // ✅ SAFE single-line URL
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&daily=precipitation_sum,temperature_2m_max,relative_humidity_2m_mean,wind_speed_10m_max` +
      `&past_days=14` +
      `&forecast_days=7` +
      `&timezone=auto`;

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Open-Meteo error:", errorText);

      return NextResponse.json(
        { error: "Weather provider error" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Weather API error:", error);

    return NextResponse.json(
      { error: "Unable to fetch weather data" },
      { status: 500 }
    );
  }
}
