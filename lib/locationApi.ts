import axios from "axios";
interface Location {
  state: string;
  district: string;
  taluka: string;
  village: string;
}

/* ================= CACHE ================= */
let cachedStates: string[] | null = null;

/* ================= STATES ================= */
export const getStates = async (): Promise<string[]> => {
  if (cachedStates) return cachedStates;

  const res = await axios.get("/api/location", {
    params: { type: "states" },
  });

  const states = res.data?.data?.states?.map((s: Location) => s.state) || [];

  cachedStates = states;
  return states;
};

/* ================= DISTRICTS ================= */
export const getDistricts = async (state: string): Promise<string[]> => {
  if (!state) return [];

  const res = await axios.get("/api/location", {
    params: { type: "districts", state },
  });

  return res.data?.data?.districts?.map((d: Location) => d.district) || [];
};

/* ================= BLOCKS ================= */
export const getBlocks = async (
  state: string,
  district: string,
): Promise<string[]> => {
  if (!state || !district) return [];

  const res = await axios.get("/api/location", {
    params: { type: "blocks", state, district },
  });

  return res.data?.data?.talukas?.map((b: Location) => b.taluka) || [];
};

/* ================= VILLAGES ================= */
export const getVillages = async (
  state: string,
  district: string,
  taluka: string,
): Promise<string[]> => {
  if (!state || !district || !taluka) return [];

  const res = await axios.get("/api/location", {
    params: { type: "villages", state, district, taluka },
  });

  return res.data?.data?.villages?.map((v: Location) => v.village) || [];
};
