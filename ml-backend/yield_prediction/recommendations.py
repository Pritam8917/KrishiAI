def infer_growth_stage(ndvi: float) -> str:
    """
    Estimate crop growth stage using NDVI.
    """
    if ndvi is None:
        return "unknown"

    if ndvi < 0.35:
        return "early_growth"
    elif ndvi < 0.6:
        return "vegetative"
    else:
        return "reproductive"


def generate_farmer_advice(
    ndvi: float,
    ndwi: float,
    rain7d: float,
    maxTemp: float,
    humidity: float,
    crop_type: str
):
    advice = []
    priority_actions = []
    do_not_do = []

    # ---------- SAFETY CAST ----------
    ndvi = float(ndvi or 0)
    ndwi = float(ndwi or 0)
    rain7d = float(rain7d or 0)
    maxTemp = float(maxTemp or 0)
    humidity = float(humidity or 0)
    crop_type = (crop_type or "").lower()

    # ---------- Growth Stage ----------
    stage = infer_growth_stage(ndvi)

    # ---------- Water Stress ----------
    if ndwi < 0.2:
        priority_actions.append(
            "Provide light irrigation during early morning or evening"
        )
        advice.append(
            "🌧️ Soil moisture is low. Timely irrigation can reduce crop stress."
        )
        do_not_do.append(
            "Do not delay irrigation during prolonged dry conditions"
        )

    elif rain7d > 50:
        advice.append(
            "💧 Recent rainfall is sufficient. Irrigation is not required at present."
        )
        do_not_do.append(
            "Do not over-irrigate after heavy rainfall"
        )

    # ---------- Fertilizer (Farmer Friendly) ----------
    if stage == "early_growth":
        advice.append(
            "🌱 Early growth: Crop needs nitrogen and phosphorus for root and leaf growth."
        )
        priority_actions.append(
            "Apply Urea 20–25 kg/acre + DAP 10–12 kg/acre after irrigation"
        )
        do_not_do.append(
            "Do not apply fertilizer on dry soil"
        )

    elif stage == "vegetative":
        advice.append(
            "🌿 Vegetative stage: Balanced nutrients increase plant height and tillers."
        )
        priority_actions.append(
            "Apply 19:19:19 NPK @ 10 kg/acre (soil or foliar)"
        )
        do_not_do.append(
            "Do not overuse urea at this stage"
        )

    elif stage == "reproductive":
        advice.append(
            "🌾 Flowering/grain stage: Potassium improves grain size and quality."
        )
        priority_actions.append(
            "Apply MOP (Potash) 8–10 kg/acre or SOP 5 kg/acre"
        )
        do_not_do.append(
            "Avoid nitrogen-heavy fertilizer during flowering"
        )

    # ---------- NDVI Nutrient Stress ----------
    if ndvi < 0.4:
        advice.append(
            "📉 Low crop greenness detected. Indicates nutrient deficiency."
        )
        priority_actions.append(
            "Spray micronutrient mixture or 2% urea foliar spray"
        )

    # ---------- Rain Leaching ----------
    if rain7d > 60:
        advice.append(
            "🌧️ Heavy rainfall may wash away nutrients."
        )
        priority_actions.append(
            "Apply light split dose of urea (10 kg/acre)"
        )

    # ---------- Crop Specific ----------
    if crop_type == "rice":
        advice.append(
            "🌾 Rice advisory: Nitrogen split application improves tillering."
        )
        priority_actions.append(
            "Apply Urea in 3 splits (basal, tillering, panicle)"
        )

    elif crop_type == "wheat":
        advice.append(
            "🌾 Wheat advisory: Nitrogen at CRI stage increases grain yield."
        )
        priority_actions.append(
            "Apply Urea 25 kg/acre at CRI stage"
        )

    elif crop_type == "maize":
        advice.append(
            "🌽 Maize advisory: Nitrogen is critical at knee-high stage."
        )
        priority_actions.append(
            "Apply Urea 30 kg/acre at knee-high stage"
        )

    # ---------- Heat Stress ----------
    if maxTemp > 35:
        advice.append(
            "☀️ High temperature stress detected."
        )
        priority_actions.append(
            "Schedule irrigation or spraying during cooler hours"
        )
        do_not_do.append(
            "Do not spray during midday heat"
        )

    # ---------- Disease Risk ----------
    if humidity > 80 and rain7d > 40:
        advice.append(
            "🦠 High humidity and rainfall increase fungal disease risk."
        )
        do_not_do.append(
            "Avoid excess nitrogen under high humidity"
        )

    # ---------- Risk Scores ----------
    risks = {
        "water_stress_risk": "High" if ndwi < 0.2 else "Low",
        "nutrient_stress_risk": (
            "High" if ndvi < 0.45 else
            "Medium" if ndvi < 0.6 else
            "Low"
        ),
        "disease_risk": "High" if humidity > 80 and rain7d > 40 else "Low"
    }

    # ---------- Disclaimer ----------
    advice.append(
        "⚠️ Advisory is based on satellite and weather indicators. Consult local agriculture experts before chemical use."
    )

    return {
        "growth_stage": stage,
        "priority_actions": priority_actions[:4],
        "farmer_advisory": advice,
        "do_not_do": do_not_do,
        "risk_levels": risks
    }
