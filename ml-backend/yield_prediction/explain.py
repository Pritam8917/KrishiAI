from model_utils import predict_yield

def explain_yield_drivers(data):
    reasons = []

    if data["rain7d"] < 20:
        reasons.append("Low rainfall in the past week reduced soil moisture.")

    if data["ndvi"] < 0.45:
        reasons.append("Low vegetation index indicates weak crop growth.")

    if data["maxTemp"] > 35:
        reasons.append("High temperature may have stressed the crop.")

    if not reasons:
        reasons.append("Weather and crop health indicators are favorable.")

    return reasons
def simulate_improvement(data):
    improved = data.copy()

    if improved["ndwi"] < 0.3:
        improved["ndwi"] = 0.45

    return predict_yield(improved)

def yield_confidence(yield_value):
    margin = yield_value * 0.07
    return round(yield_value - margin, 2), round(yield_value + margin, 2)
