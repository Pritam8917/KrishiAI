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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://krishi-ai-weld-nine.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Advisory Input
# -----------------------------
class AdvisoryInput(BaseModel):
    user_id: str
    rain7d: float
    rain14d: float
    maxtemp: float
    humidity: float
    windspeed: float
    ndvi: float
    ndwi: float

# -----------------------------
# Fetch user farm data
# -----------------------------
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

# -----------------------------
# API Endpoint
# -----------------------------
@app.post("/predict-yield")
def predict_yield_and_advisory(advisory: AdvisoryInput):
    try:
        user_id = advisory.user_id   # only one source

        # 1. Fetch farm data
        farm_data = fetch_user_farm_data(user_id)
        if not farm_data:
            raise HTTPException(status_code=404, detail="Farm data not found")

        if farm_data["land_size"] <= 0:
            raise HTTPException(status_code=400, detail="Invalid farm size")

        # 2. Save advisory data
        res = supabase.from_("advisory_data").insert({
            **advisory.model_dump()
        }).execute()

        if not res.data:
            raise Exception("Supabase insert failed")


        # 3. ML input
        model_input = {
            "crop_name": farm_data["crop"],
            "district_name": farm_data["district"],
            "area": farm_data["land_size"]
        }

        # 4. Prediction
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
        raise HTTPException(status_code=500, detail=str(e))
