def infer_growth_stage(ndvi: float) -> str:
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
    
    # 🌾 Growth Stage Detection
    stage = infer_growth_stage(ndvi)

    # 🌧️ Water Stress & Irrigation
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

    # 🌱 Fertilizer Recommendations
    if stage == "early_growth":
        advice.append(
            "🌱 Crop is in early growth stage. Nitrogen helps in leaf and stem development."
        )
        priority_actions.append(
            "Apply nitrogen fertilizer after irrigation"
        )
        do_not_do.append(
            "Do not apply heavy fertilizer before irrigation"
        )

    elif stage == "vegetative":
        advice.append(
            "🌿 Crop is in vegetative stage. Balanced nutrition supports biomass and tiller formation."
        )
        priority_actions.append(
            "Apply balanced NPK fertilizer"
        )
        do_not_do.append(
            "Do not apply excess nitrogen at this stage"
        )

    else:  # reproductive
        advice.append(
            "🌾 Crop is in reproductive stage. Potassium helps improve grain quality and stress tolerance."
        )
        priority_actions.append(
            "Ensure adequate potassium availability"
        )
        do_not_do.append(
            "Avoid excess nitrogen during flowering and grain filling"
        )


    # 🌾 Crop-Specific Notes

    crop = crop_type.lower()

    if crop == "rice":
        advice.append(
            "🌾 Rice advisory: Split nitrogen application during tillering improves yield response."
        )
    elif crop == "wheat":
        advice.append(
            "🌾 Wheat advisory: Balanced nutrition supports grain filling and reduces lodging risk."
        )
    elif crop == "maize":
        advice.append(
            "🌽 Maize advisory: Nitrogen availability during early growth and knee-high stage is important."
        )

    # ☀️ Heat Stress Management
    if maxTemp > 35:
        advice.append(
            "☀️ High temperature stress detected. Heat may reduce fertilizer efficiency."
        )
        priority_actions.append(
            "Schedule irrigation or spraying during cooler hours"
        )
        do_not_do.append(
            "Do not spray fertilizers or pesticides during midday heat"
        )

  
    # 🦠 Disease Risk
    if humidity > 80 and rain7d > 40:
        advice.append(
            "🦠 High humidity and rainfall increase disease risk. Monitor crops for fungal infections."
        )
        do_not_do.append(
            "Avoid excess nitrogen under high humidity conditions"
        )

 
    # ⚠️ Risk Scores (Explainable)
    risks = {
        "water_stress_risk": "High" if ndwi < 0.2 else "Low",
        "nutrient_stress_risk": "High" if ndvi < 0.45 else "Medium" if ndvi < 0.6 else "Low",
        "disease_risk": "High" if humidity > 80 and rain7d > 40 else "Low"
    }

    # ⚠️ Disclaimer
    advice.append(
        "⚠️ Advisory is based on weather and satellite indicators. Consult local agriculture experts before chemical use."
    )

    return {
        "growth_stage": stage,
        "priority_actions": priority_actions[:3],  # top actions only
        "farmer_advisory": advice,
        "do_not_do": do_not_do,
        "risk_levels": risks
    }
