import json
import joblib
import pandas as pd

from explain import (
    explain_yield_drivers,
    simulate_improvement,
    yield_confidence,
)

from recommendations import generate_farmer_advice

# Load trained pipeline
pipe = joblib.load("model/yield_model.pkl")

# Sample Input
farm_data = {
    "crop_type": "Rice",
    "rainfall": 42.0,
    "temperature": 34.0,
    "humidity": 78.0,
    "wind_speed": 2.5,
}

# Convert to DataFrame
df = pd.DataFrame([farm_data])

# Prediction
predicted_yield = float(pipe.predict(df)[0])

# Confidence
low, high = yield_confidence(predicted_yield)

# Explain prediction
yield_explanation = explain_yield_drivers(farm_data)

# Simulate improved farming practices
potential_yield = simulate_improvement(farm_data)

# Generate advisory
advisory = generate_farmer_advice(
    rainfall=farm_data["rainfall"],
    temperature=farm_data["temperature"],
    humidity=farm_data["humidity"],
    windspeed=farm_data["wind_speed"],
    crop_type=farm_data["crop_type"],
)

# Final Response
response = {
    "yield_forecast": {
        "predicted_yield": round(predicted_yield, 2),
        "unit": "tons/hectare",
        "confidence_range": f"{low} – {high}",
        "potential_yield_after_improvement": potential_yield,
    },
    "yield_explanation": yield_explanation,
    "advisory": {
        "growth_stage": advisory.get("growth_stage"),
        "priority_actions": advisory.get("priority_actions", []),
        "recommendations": advisory.get("farmer_advisory", []),
        "do_not_do": advisory.get("do_not_do", []),
        "risk_levels": advisory.get("risk_levels", {}),
    },
}

print(json.dumps(response, indent=2))