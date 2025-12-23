"use client";

import { useEffect, useState } from "react";
import {
  getStates,
  getDistricts,
  getVillages,
  getBlocks,
} from "@/lib/locationApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
/* ================= TYPES ================= */

export interface Location {
  state: string;
  district: string;
  block: string;
  village: string;
  latitude: number | null;
  longitude: number | null;
}

interface Props {
  location: Location | null;
  onLocationChange: (location: Location) => void;
  // onCoordinatesFound: (lat: number, lon: number) => void;
}

/* ================= DEFAULT LOCATION ================= */

const EMPTY_LOCATION: Location = {
  state: "",
  district: "",
  block: "",
  village: "",
  latitude: null,
  longitude: null,
};

/* ================= COMPONENT ================= */

export default function LocationSelector({
  location,
  onLocationChange,
}: // onCoordinatesFound,
Props) {
  const safeLocation = location ?? EMPTY_LOCATION;

  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [isGeolocating, setIsGeolocating] = useState(false);

  /* ================= GPS ================= */

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("❌ GPS not supported");
      return;
    }

    setIsGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // onCoordinatesFound(lat, lon);

        const geo = await reverseGeocode(lat, lon);

        const stateList = states.length ? states : await getStates();
        setStates(stateList);

        const matchedState = findBestMatch(geo.state, stateList);
        if (!matchedState) {
          alert("⚠️ State not matched. Select manually.");
          setIsGeolocating(false);
          return;
        }

        const apiDistricts = await getDistricts(matchedState);
        setDistricts(apiDistricts);

        const matchedDistrict = findBestMatch(geo.district, apiDistricts);

        onLocationChange({
          state: matchedState,
          district: matchedDistrict,
          block: "",
          village: "",
          latitude: lat,
          longitude: lon,
        });

        toast.success("✅ GPS Location Captured");
        setIsGeolocating(false);
      },
      () => {
        alert("❌ GPS permission denied");
        setIsGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* ================= FETCHERS ================= */

  useEffect(() => {
    getStates().then(setStates);
  }, []);

  useEffect(() => {
    if (!safeLocation.state) return;
    getDistricts(safeLocation.state).then(setDistricts);
  }, [safeLocation.state]);

  useEffect(() => {
    if (!safeLocation.state || !safeLocation.district) return;
    getBlocks(safeLocation.state, safeLocation.district).then(setBlocks);
  }, [safeLocation.state, safeLocation.district]);

  useEffect(() => {
    if (!safeLocation.state || !safeLocation.district) return;
    getVillages(
      safeLocation.state,
      safeLocation.district,
      safeLocation.block
    ).then(setVillages);
  }, [safeLocation.state, safeLocation.district, safeLocation.block]);

  /* ================= HELPERS ================= */

  async function reverseGeocode(lat: number, lon: number) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await res.json();
    const a = data.address || {};
    return {
      state: a.state || "",
      district: a.state_district || a.county || "",
    };
  }

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z]/g, "");

  const findBestMatch = (value: string, list: string[]) =>
    list.find((i) => normalize(i) === normalize(value)) || "";

  /* ================= HANDLERS ================= */

  const handleStateChange = (value: string) => {
    onLocationChange({ ...EMPTY_LOCATION, state: value });
    setDistricts([]);
    setBlocks([]);
    setVillages([]);
  };

  const handleDistrictChange = (value: string) => {
    onLocationChange({
      ...safeLocation,
      district: value,
      block: "",
      village: "",
    });
    setBlocks([]);
    setVillages([]);
  };

  const handleBlockChange = (value: string) => {
    onLocationChange({ ...safeLocation, block: value, village: "" });
    setVillages([]);
  };

  const handleVillageChange = async (value: string) => {
    onLocationChange({ ...safeLocation, village: value });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${value},${safeLocation.district},${safeLocation.state},India`
    );
    const data = await res.json();

    if (data?.length) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      onLocationChange({
        ...safeLocation,
        village: value,
        latitude: lat,
        longitude: lon,
      });

      // onCoordinatesFound(lat, lon);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className="w-12 h-10 rounded-full bg-[#E4EAE5] flex items-center justify-center">
            <MapPin className="w-5 h-5 text-green-800" />{" "}
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-foreground">
              Farm Location Details{" "}
            </h3>
            <p className="text-sm text-green-800">Select your farm location</p>
            {/* FARMER FRIENDLY TIP */}{" "}
            <div className="mt-2 rounded-lg bg-[#E4F2EB] border border-green-300 p-3 text-sm text-green-900 leading-relaxed">
              🌾 <b>For best results (one-time only):</b> <br /> Visit your farm
              once and tap <b>“Use GPS”</b>. This helps us capture your{" "}
              <b>exact field location</b> for accurate crop health, weather, and
              satellite analysis. <br />{" "}
              <span className="text-xs text-green-700">
                You won’t need GPS again unless you change your farm location.{" "}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          className=" text-green-900 border-green-700 hover:bg-green-700 hover:text-white font-medium flex items-center gap-2 ring-1 ring-green-300 cursor-pointer "
        >
          {" "}
          {isGeolocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}{" "}
          Use GPS{" "}
        </Button>
      </div>

      {/* SELECTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={safeLocation.state} onValueChange={handleStateChange}>
          <SelectTrigger>
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            {states.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={safeLocation.district}
          onValueChange={handleDistrictChange}
          disabled={!safeLocation.state}
        >
          <SelectTrigger>
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={safeLocation.block}
          onValueChange={handleBlockChange}
          disabled={!safeLocation.district}
        >
          <SelectTrigger>
            <SelectValue placeholder="Block" />
          </SelectTrigger>
          <SelectContent>
            {blocks.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={safeLocation.village}
          onValueChange={handleVillageChange}
          disabled={!safeLocation.block}
        >
          <SelectTrigger>
            <SelectValue placeholder="Village" />
          </SelectTrigger>
          <SelectContent>
            {villages.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SUCCESS */}
      {safeLocation.latitude && safeLocation.longitude && (
        <div className="text-sm text-green-700">
          ✅ Location saved ({safeLocation.latitude}, {safeLocation.longitude})
        </div>
      )}
    </div>
  );
}
