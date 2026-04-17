import joblib
import pandas as pd
from explain import explain_yield_drivers, simulate_improvement, yield_confidence
from recommendations import generate_farmer_advice

# Load full pipeline
pipe = joblib.load("model/yield_model.pkl")

# Example FARM input
farm_data = {
    "crop_name": "Rice",
    "district_name": "Cuttack",
    "area": 2.5,
    "rain7d": 42,
    "ndvi": 0.52,
    "ndwi": 0.18,
    "humidity": 78,
    "maxTemp": 34
}
df = pd.DataFrame([farm_data])

# Yield Prediction (NO manual encoding)
predicted_yield = float(pipe.predict(df)[0])
low, high = yield_confidence(predicted_yield)

# Explain yield drivers
yield_explanation = explain_yield_drivers(farm_data)

# Yield improvement simulation
potential_yield = simulate_improvement(farm_data)

# Advisory input
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

# Final response
response = {
    "yield_forecast": {
        "predicted_yield": round(predicted_yield, 2),
        "unit": "tons/hectare",
        "confidence_range": f"{low} – {high}",
        "potential_yield_after_improvement": potential_yield
    },
    "yield_explanation": yield_explanation,

    "advisory": {
        "growth_stage": advisory.get("growth_stage"),
        "priority_actions": advisory.get("priority_actions", []),
        "recommendations": advisory.get("farmer_advisory", []),
        "do_not_do": advisory.get("do_not_do", []),
        "risk_levels": advisory.get("risk_levels", {})
    }
}

import json
print(json.dumps(response, indent=2))
