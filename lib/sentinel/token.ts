import axios from "axios";
const tokenURL = "https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token";

export async function getSentinelToken() {
  const res = await axios.post(
    tokenURL,
    
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SENTINEL_CLIENT_ID!,
      client_secret: process.env.SENTINEL_CLIENT_SECRET!,
    }),

    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }

  );
  return res.data.access_token as string;
}
