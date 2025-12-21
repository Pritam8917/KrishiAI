import axios from "axios";

interface State {
  name: string;
}
interface District {
  name: string;
}
interface Block {
  name: string;
}
interface Village {
  name: string;
}
export const getStates = async (): Promise<string[]> => {
  const res = await axios.get(
    "https://www.india-location-hub.in/api/locations/states"
  );
  const statesArray = res.data?.data?.states;
  if (!Array.isArray(statesArray)) return [];
  return statesArray.map((s: State) => s.name);
};

export const getDistricts = async (state: string): Promise<string[]> => {
  const res = await axios.get(
    "https://www.india-location-hub.in/api/locations/districts",
    { params: { state } }
  );
  const districtsArray = res.data?.data?.districts;
  if (!Array.isArray(districtsArray)) return [];
  return districtsArray.map((d: District) => d.name);
};

export const getBlocks = async (
  state: string,
  district: string
): Promise<string[]> => {
  const res = await axios.get("https://www.india-location-hub.in/api/locations/talukas", {
    params: { state, district },
  });
  const BlocksArray = res.data?.data?.talukas;
  if (!Array.isArray(BlocksArray)) return [];
  return BlocksArray.map((b: Block) => b.name);
};

export const getVillages = async (
  state: string,
  district: string,
  taluka: string
): Promise<string[]> => {
  const res = await axios.get( 
    "https://www.india-location-hub.in/api/locations/villages", {
    params: { state, district, taluka },
  });

  console.log("VILLAGES RAW RESPONSE:", res.data);

  const villagesArray = res.data?.data?.villages;
  if (!Array.isArray(villagesArray)) {
    console.error("Villages is not an array:", villagesArray);
    return [];
  }

  return villagesArray.map((v: Village) => v.name);
};