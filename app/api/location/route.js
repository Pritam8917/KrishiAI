import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const state = searchParams.get("state");
    const district = searchParams.get("district");
    const taluka = searchParams.get("taluka");

    let url = "";
    let params = {};

    switch (type) {
      case "states":
        url = "https://www.india-location-hub.in/api/locations/states";
        break;

      case "districts":
        url = "https://www.india-location-hub.in/api/locations/districts";
        params = { state };
        break;

      case "blocks":
        url = "https://www.india-location-hub.in/api/locations/talukas";
        params = { state, district };
        break;

      case "villages":
        url = "https://www.india-location-hub.in/api/locations/villages";
        params = { state, district, taluka };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
    }

    const res = await axios.get(url, {
      params,
      timeout: 8000, // ✅ prevents hanging
    });

    return NextResponse.json(res.data);

  } catch (error) {
    console.error("Location API error:", error.message);

    return NextResponse.json(
      { error: "Failed to fetch location data" },
      { status: 500 }
    );
  }
}