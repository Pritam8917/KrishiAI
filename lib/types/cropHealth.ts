export interface FarmProfile {
  state: string;
  district: string;
  village: string;
  crop: string;
  latitude: number;
  longitude: number;
}
export interface WeatherData {
  daily: {
    precipitation_sum: number[];           // mm
    temperature_2m_max: number[];           // °C
    relative_humidity_2m_mean: number[];  // %
    wind_speed_10m_max: number[];  // km/h
  };
}

