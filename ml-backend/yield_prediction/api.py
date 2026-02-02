from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client

from model import predict_yield
from explain import explain_yield_drivers, simulate_improvement, yield_confidence
from recommendations import generate_farmer_advice

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials missing in .env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="AI Crop Yield Prediction & Advisory API")

# -----------------------------
# Advisory Input
# -----------------------------
class AdvisoryInput(BaseModel):
    rain7d: float
    rain14d: float
    maxTemp: float
    humidity: float
    windSpeed: float
    ndvi: float
    ndwi: float


# -----------------------------
# Fetch user farm data
# -----------------------------
def fetch_user_farm_data(user_id: str):
    res = (
        supabase
        .from_("farm_profiles")
        .select("crop, land_size, district, season")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    return res.data


# -----------------------------
# API Endpoint
# -----------------------------
@app.post("/predict-yield/{user_id}")
def predict_yield_and_advisory(user_id: str, advisory: AdvisoryInput):

    farm_data = fetch_user_farm_data(user_id)
    if not farm_data:
        raise HTTPException(status_code=404, detail="Farm data not found")

    if farm_data["land_size"] <= 0:
        raise HTTPException(status_code=400, detail="Invalid farm size")

    # 🔹 Merge ML input
    model_input = {
        "rain7d": advisory.rain7d,
        "rain14d": advisory.rain14d,
        "maxTemp": advisory.maxTemp,
        "humidity": advisory.humidity,
        "windSpeed": advisory.windSpeed,
        "ndvi": advisory.ndvi,
        "ndwi": advisory.ndwi,
        "crop_type": farm_data["crop"],
    }

    # 1️⃣ Yield prediction
    predicted_yield = round(predict_yield(model_input), 2)
    low, high = yield_confidence(model_input)

    # 2️⃣ Explanation
    yield_explanation = explain_yield_drivers(model_input)

    # 3️⃣ Improvement simulation
    potential_yield = simulate_improvement(model_input)

    # 4️⃣ Advisory
    advisory_response = generate_farmer_advice(
        ndvi=advisory.ndvi,
        ndwi=advisory.ndwi,
        rain7d=advisory.rain7d,
        maxTemp=advisory.maxTemp,
        humidity=advisory.humidity,
        crop_type=farm_data["crop"]
    )

    return {
        "yield_forecast": {
            "predicted_yield": predicted_yield,
            "unit": "tons/hectare",
            "confidence_range": f"{low} – {high}",
            "potential_yield_after_improvement": potential_yield
        },
        "yield_explanation": yield_explanation,
        "farmer_advisory": advisory_response
    }
