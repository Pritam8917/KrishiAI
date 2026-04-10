from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client
import traceback
from model_utils import predict_yield
from explain import explain_yield_drivers, simulate_improvement, yield_confidence
from recommendations import generate_farmer_advice
from fastapi.middleware.cors import CORSMiddleware

# Load ENV
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials missing")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# FastAPI Init
app = FastAPI(title="AI Crop Yield Prediction API")

# CORS FIXED (NO TRAILING /)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://krishi-ai-virid.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Advisory Input Schema
class AdvisoryInput(BaseModel):
    user_id: str
    rain7d: float
    rain14d: float
    maxtemp: float
    humidity: float
    windspeed: float | None = None
    ndvi: float
    ndwi: float

# Fetch Farm Data
def fetch_user_farm_data(user_id: str):

    res = (
        supabase
        .from_("farm_profiles")
        .select("crop, land_size, district")
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    return res.data

# Prediction Endpoint
@app.post("/predict-yield")
def predict_yield_and_advisory(advisory: AdvisoryInput):

    try:
        user_id = advisory.user_id
        
        # Fetch Farm Data
        farm_data = fetch_user_farm_data(user_id)

        if not farm_data:
            raise HTTPException(404, "Farm data not found")

        if farm_data.get("land_size", 0) <= 0:
            raise HTTPException(400, "Invalid farm size")

        # ML Input
        model_input = {
            "crop_name": farm_data.get("crop"),
            "district_name": farm_data.get("district"),
            "area": farm_data.get("land_size")
        }

        # ML Prediction
        predicted_yield = round(predict_yield(model_input), 2)

        low, high = yield_confidence(predicted_yield)

        yield_explanation = explain_yield_drivers(model_input)

        potential_yield = simulate_improvement(model_input)

        advisory_response = generate_farmer_advice(
            ndvi=advisory.ndvi,
            ndwi=advisory.ndwi,
            rain7d=advisory.rain7d,
            maxTemp=advisory.maxtemp,
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
            "farmer_advisory": advisory_response["farmer_advisory"]
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))
