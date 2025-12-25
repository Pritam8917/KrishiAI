import { NextResponse } from "next/server";
import axios from "axios";
import { getSentinelToken } from "@/lib/sentinel/token";
import { NDVI_NDWI_EVALSCRIPT } from "@/lib/sentinel/evalscripts";

const STATS_URL = "https://services.sentinel-hub.com/api/v1/statistics";

/* ================= TYPES ================= */

type SentinelBandStats = {
  stats: {
    mean: number | null;
  } | null;
};

type SentinelStatsItem = {
  interval: {
    from: string;
    to: string;
  };
  outputs?: {
    ndvi?: SentinelBandStats;
    ndwi?: SentinelBandStats;
  };
};

type SentinelStatsResponse = {
  data: SentinelStatsItem[];
};

/* ================= ROUTE ================= */

export async function POST(req: Request) {
  console.log("🔥 Sentinel route hit");

  try {
    const { lat, lon } = await req.json();

    if (typeof lat !== "number" || typeof lon !== "number") {
      return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
    }

    const token = await getSentinelToken();

    // Small farm area (~300–400m)
    const delta = 0.00025;

    const to = new Date();
    const from = new Date();

    from.setDate(to.getDate() - 20); // last 20 days

    const response = await axios.post<SentinelStatsResponse>(
      STATS_URL,
      {
        input: {
          bounds: {
            bbox: [lon - delta, lat - delta, lon + delta, lat + delta],
            properties: {
              crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
            },
          },
          data: [
            {
              type: "sentinel-2-l2a",
              dataFilter: {
                timeRange: {
                  from: from.toISOString(),
                  to: to.toISOString(),
                },
                mosaickingOrder: "leastCC",
                maxCloudCoverage: 60,
              },
            },
          ],
        },

        aggregation: {
          timeRange: {
            from: from.toISOString(),
            to: to.toISOString(),
          },
          aggregationInterval: { of: "P1D" }, // ✅ daily NDVI/NDWI
          evalscript: NDVI_NDWI_EVALSCRIPT,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    if (!response.data?.data?.length) {
      return NextResponse.json(
        { error: "No Sentinel data returned" },
        { status: 404 }
      );
    }

    /* ================= PARSE RESULT ================= */

    const timeline = response.data.data.map((d) => ({
      date: d.interval.from,
      ndvi: d.outputs?.ndvi?.stats?.mean ?? null,
      ndwi: d.outputs?.ndwi?.stats?.mean ?? null,
    }));

    return NextResponse.json({ timeline });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("❌ SENTINEL STATUS:", err.response?.status);
      console.error("❌ SENTINEL DATA:", err.response?.data);

      return NextResponse.json(
        {
          error: "Sentinel indices fetch failed",
          details: err.response?.data ?? err.message,
        },
        { status: 500 }
      );
    }

    console.error("❌ UNKNOWN ERROR:", err);
    return NextResponse.json(
      { error: "Unknown server error" },
      { status: 500 }
    );
  }
}
