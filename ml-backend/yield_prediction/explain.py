def explain_yield_drivers(data):
    reasons = []

    # Area based reasoning
    if data["land_size"] > 5:
        reasons.append("Larger land area increases total production potential.")
    else:
        reasons.append("Smaller land area limits total yield.")

    # Crop + region reasoning
    reasons.append(
        f"Historical yield patterns of {data['crop_name']} in {data['district_name']} were used."
    )

    return reasons


def simulate_improvement(data):
    improved = data.copy()

    # simulate 10% area improvement
    improved["land_size"] = improved["land_size"] * 1.1

    return improved["land_size"]


def yield_confidence(yield_value):
    margin = yield_value * 0.07
    return round(yield_value - margin, 2), round(yield_value + margin, 2)
