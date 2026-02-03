import joblib
import os
import pandas as pd

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model", "yield_model.pkl")

pipe = joblib.load(MODEL_PATH)
def predict_yield(data):
    df = pd.DataFrame([data])
    return float(pipe.predict(df)[0])
