import joblib
import pandas as pd

from explain import explain_yield_drivers, simulate_improvement, yield_confidence
from recommendations import generate_farmer_advice

# -----------------------------
# Load trained model
# -----------------------------
bundle = joblib.load("yield_model.pkl")
model = bundle["model"]
encoders = bundle["encoders"]
FEATURES = bundle["features"]

# -----------------------------
# Example FARM input (yield model)
# -----------------------------
farm_data = {
    "crop_name": "Rice",
    "season": "Kharif",
    "district_name": "Cuttack",
    "area": 2.5
}

df = pd.DataFrame([farm_data])

# Encode categorical values
for col, encoder in encoders.items():
    df[col] = encoder.transform(df[col])

# -----------------------------
# 1️⃣ Yield Prediction
# -----------------------------
predicted_yield = float(model.predict(df[FEATURES])[0])
low, high = yield_confidence(predicted_yield)

# -----------------------------
# 2️⃣ Explain yield drivers
# -----------------------------
yield_explanation = explain_yield_drivers(farm_data)

# -----------------------------
# 3️⃣ Yield improvement simulation
# -----------------------------
potential_yield = simulate_improvement(farm_data)

# -----------------------------
# 4️⃣ Advisory input (mock real-time data)
# -----------------------------
weather_data = {
    "ndvi": 0.52,
    "ndwi": 0.18,
    "rain7d": 42,
    "maxTemp": 34,
    "humidity": 78
}

advisory = generate_farmer_advice(
    ndvi=weather_data["ndvi"],
    ndwi=weather_data["ndwi"],
    rain7d=weather_data["rain7d"],
    maxTemp=weather_data["maxTemp"],
    humidity=weather_data["humidity"],
    crop_type=farm_data["crop_name"]
)

# -----------------------------
# 5️⃣ Final API-like response
# -----------------------------
response = {
    "yield_forecast": {
        "predicted_yield": round(predicted_yield, 2),
        "unit": "tons/hectare",
        "confidence_range": f"{low} – {high}",
        "potential_yield_after_improvement": potential_yield
    },
    "yield_explanation": yield_explanation,
    "farmer_advisory": advisory
}

# Pretty print
import json
print(json.dumps(response, indent=2))
