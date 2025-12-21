"use client";

import { useEffect, useState } from "react";
import {
  getStates,
  getDistricts,
  getVillages,
  getBlocks,
} from "@/lib/locationApi";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { Button } from "../ui/button";

interface Location {
  state: string;
  district: string;
  block: string;
  village: string;
  latitude?: number;
  longitude?: number;
}

interface Props {
  location: Location;
  onLocationChange: (location: Location, latitude: number | null) => void;
  onCoordinatesFound: (lat: number, lon: number) => void;
}

export default function LocationSelector({
  location,
  onLocationChange,
  onCoordinatesFound,
}: Props) {
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [isGeolocating, setIsGeolocating] = useState(false);

  /* Get gps locaton*/
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("❌ GPS not supported on this device");
      return;
    }

    setIsGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        onCoordinatesFound(lat, lon);

        let geo;
        try {
          geo = await reverseGeocode(lat, lon);
        } catch {
          alert(
            "⚠️ GPS found but address lookup failed. Please select manually."
          );
          setIsGeolocating(false);
          return;
        }

        /* ---------------- STATE ---------------- */
        const stateList = states.length ? states : await getStates();
        setStates(stateList);

        const matchedState = findBestMatch(geo.state, stateList);

        if (!matchedState) {
          alert(
            "📍 GPS detected, but state could not be matched. Please select manually."
          );
        }

        onLocationChange(
          {
            state: matchedState,
            district: "",
            block: "",
            village: "",
            latitude: lat,
            longitude: lon,
          },
          lat
        );

        if (!matchedState) {
          setIsGeolocating(false);
          return;
        }

        /* ---------------- DISTRICT ---------------- */
        const apiDistricts = await getDistricts(matchedState);
        setDistricts(apiDistricts);

        const matchedDistrict = findBestMatch(geo.district, apiDistricts);

        if (!matchedDistrict) {
          alert(
            "⚠️ District not matched automatically. Please select manually."
          );
        }

        onLocationChange(
          {
            state: matchedState,
            district: matchedDistrict,
            block: "",
            village: "",
            latitude: lat,
            longitude: lon,
          },
          lat
        );

        if (!matchedDistrict) {
          setIsGeolocating(false);
          return;
        }

        /* ---------------- BLOCK ---------------- */
        const apiBlocks = await getBlocks(matchedState, matchedDistrict);
        setBlocks(apiBlocks);

        const matchedBlock = findBestMatch(geo.block, apiBlocks);

        if (!matchedBlock) {
          alert("⚠️ Block could not be matched. Please select block manually.");
        }

        onLocationChange(
          {
            state: matchedState,
            district: matchedDistrict,
            block: matchedBlock,
            village: "",
            latitude: lat,
            longitude: lon,
          },
          lat
        );

        if (!matchedBlock) {
          setIsGeolocating(false);
          return;
        }

        /* ---------------- VILLAGE ---------------- */
        const apiVillages = await getVillages(
          matchedState,
          matchedDistrict,
          matchedBlock
        );
        setVillages(apiVillages);

        const matchedVillage = findBestMatch(geo.village, apiVillages);

        if (!matchedVillage) {
          alert(
            "⚠️ Village not matched automatically. Please select village manually."
          );
        }

        onLocationChange(
          {
            state: matchedState,
            district: matchedDistrict,
            block: matchedBlock,
            village: matchedVillage,
            latitude: lat,
            longitude: lon,
          },
          lat
        );

        alert("✅ GPS location captured successfully");
        setIsGeolocating(false);
      },
      (err) => {
        alert(
          err.code === err.PERMISSION_DENIED
            ? "❌ GPS permission denied"
            : "❌ Unable to fetch GPS location"
        );
        setIsGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* ---------------- FETCH STATES ---------------- */
  useEffect(() => {
    getStates().then((states) => {
      console.log("STATES FROM API:", states);
      setStates(states);
    });
  }, []);

  /* ---------------- FETCH DISTRICTS ---------------- */
  useEffect(() => {
    if (!location.state) return;
    getDistricts(location.state).then((data) => {
      setDistricts(Array.isArray(data) ? data : []);
    });
  }, [location.state]);

  /* ---------------- FETCH BLOCKS ---------------- */
  useEffect(() => {
    if (!location.state || !location.district) return;
    getBlocks(location.state, location.district).then((data) => {
      setBlocks(Array.isArray(data) ? data : []);
    });
  }, [location.state, location.district]);

  /* ---------------- FETCH VILLAGES ---------------- */
  useEffect(() => {
    if (!location.state || !location.district) return;
    getVillages(location.state, location.district, location.block).then(
      (data) => {
        setVillages(Array.isArray(data) ? data : []);
      }
    );
  }, [location.state, location.district, location.block]);

  /*Lattitude and Longitude to location  */
  async function reverseGeocode(lat: number, lon: number) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );

    const data = await res.json();
    const a = data.address || {};

    return {
      state: a.state || "",
      district: a.state_district || a.county || "",
      block: a.subdistrict || a.taluk || "",
      village: a.village || a.hamlet || a.town || "",
    };
  }

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z]/g, "");

  /* Mathcher*/
  const findBestMatch = (value: string, list: string[]) => {
    if (!value || !list.length) return "";
    const norm = normalize(value);
    return list.find((item) => normalize(item) === norm) || "";
  };

  /* ---------------- HANDLERS ---------------- */
  const handleStateChange = (value: string) => {
    onLocationChange(
      { state: value, district: "", block: "", village: "" },
      null
    );
    setDistricts([]);
    setVillages([]);
  };

  const handleDistrictChange = (value: string) => {
    onLocationChange(
      { ...location, district: value, block: "", village: "" },
      null
    );
    setVillages([]);
  };
  const handleBlockChange = (value: string) => {
    onLocationChange({ ...location, block: value, village: "" }, null);
  };

  const handleVillageChange = async (value: string) => {
    onLocationChange({ ...location, village: value }, null);

    /*get lattitude and longitude from location */
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${value},${location.district},${location.state},India`
    );
    const data = await res.json();

    if (data?.length) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      onLocationChange(
        {
          ...location,
          village: value,
          latitude: lat,
          longitude: lon,
        },
        lat
      );
      onCoordinatesFound(lat, lon);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-5">
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E4EAE5] flex items-center justify-center">
            <MapPin className="w-5 h-5 text-green-800" />
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">
              Farm Location Details
            </h3>
            <p className="text-sm text-green-800">Select your farm location</p>

            {/* FARMER FRIENDLY TIP */}
            <div className="mt-2 rounded-lg bg-[#E4F2EB] border border-green-300 p-3 text-sm text-green-900 leading-relaxed">
              🌾 <b>For best results (one-time only):</b>
              <br />
              Visit your farm once and tap <b>“Use GPS”</b>. This helps us
              capture your <b>exact field location</b> for accurate crop health,
              weather, and satellite analysis.
              <br />
              <span className="text-xs text-green-700">
                You won’t need GPS again unless you change your farm location.
              </span>
            </div>
          </div>
        </div>

        {/* ================= GPS BUTTON ================= */}
        <Button
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          className="
        text-green-900 border-green-700
        hover:bg-green-700 hover:text-white
        font-medium flex items-center gap-2
        ring-1 ring-green-300
        cursor-pointer
      "
        >
          {isGeolocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          Use GPS
        </Button>
      </div>

      {/* ================= LOCATION INPUTS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* STATE */}
        <div className="space-y-2">
          <Label>State</Label>
          <Select value={location.state} onValueChange={handleStateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* DISTRICT */}
        <div className="space-y-2">
          <Label>District</Label>
          <Select
            value={location.district}
            onValueChange={handleDistrictChange}
            disabled={!location.state}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* BLOCK */}
        <div className="space-y-2">
          <Label>Block</Label>
          <Select
            value={location.block}
            onValueChange={handleBlockChange}
            disabled={!location.district}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select block" />
            </SelectTrigger>
            <SelectContent>
              {blocks.map((block) => (
                <SelectItem key={block} value={block}>
                  {block}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* VILLAGE */}
        <div className="space-y-2">
          <Label>Village</Label>
          <Select
            value={location.village}
            onValueChange={handleVillageChange}
            disabled={!location.block}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select village" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {villages.map((village) => (
                <SelectItem key={village} value={village}>
                  {village}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ================= GPS SUCCESS ================= */}
      {location.latitude && location.longitude && (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-[#E4F2EB] border border-green-300">
          <Navigation className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-700">
              ✅ Farm location saved successfully
            </p>
            <p className="text-xs text-gray-600">
              Latitude: {location.latitude}° | Longitude: {location.longitude}°
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
