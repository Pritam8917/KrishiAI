import axios from "axios";

const tokenURL =
  "https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token";

export async function getSentinelToken() {
  const clientId = process.env.SENTINEL_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_CLIENT_SECRET;

  // 🔴 HARD FAIL if env missing
  if (!clientId || !clientSecret) {
    throw new Error("Sentinel CLIENT_ID or CLIENT_SECRET missing");
  }

  try {
    console.log("🔑 Requesting Sentinel token...");

    const res = await axios.post(
      tokenURL,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 8000, // ✅ VERY IMPORTANT
      }
    );

    if (!res.data?.access_token) {
      throw new Error("Sentinel token not returned");
    }

    console.log("🔑 Sentinel token OK");

    return res.data.access_token as string;
  } catch (err) {
    console.error("❌ SENTINEL TOKEN ERROR:", err);
    throw err;
  }
}
