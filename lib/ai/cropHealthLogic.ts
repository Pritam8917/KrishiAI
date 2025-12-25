// Water Stress Logic 
export function getWaterStress({
  ndwi,
  rain14d,
  windSpeed,
}: {
  ndwi: number;
  rain14d: number;
  windSpeed?: number; // km/h
}) {
 
  if (ndwi < -0.15) return "Severe"; // Severe stress: dry vegetation regardless of rain
  if (ndwi < 0 && rain14d < 30 && windSpeed && windSpeed > 15) {
    return "Severe";  // High evaporation scenario
  }
  if (ndwi < 0 && rain14d < 40) return "Moderate";// Moderate stress
  if (ndwi > 0.2 && rain14d > 40) return "Low";  // Healthy moisture

  return "Normal";
}

// Vegetation Health Logic
export function getVegetationStatus(ndvi: number) {
  if (ndvi > 0.6) return "Healthy";
  if (ndvi > 0.4) return "Moderate";
  return "Stressed";
}

// Nutrient Leaching Risk (Soil inferred)
export function getLeachingRisk({
  rain7d,
  ndvi,
}: {
  rain7d: number;
  ndvi: number;
}) {
  if (rain7d > 60 && ndvi < 0.45) return "High";
  if (rain7d > 40) return "Moderate";
  return "Low";
}

// Disease Risk Logic 
export function getDiseaseRisk({
  humidity,
  temp,
  rainDays,
  ndvi,
  windSpeed,
}: {
  humidity: number;
  temp: number;
  rainDays: number;
  ndvi: number;
  windSpeed?: number; // km/h
}) {
  // Ideal fungal conditions
  if (
    humidity > 80 &&
    temp >= 22 &&
    temp <= 30 &&
    rainDays >= 3 &&
    ndvi < 0.55
  ) {
    // Wind increases spore spread
    if (windSpeed && windSpeed > 12) {
      return "High (Fungal Spread)";
    }
    return "High (Fungal)";
  }

  return "Low";
}

