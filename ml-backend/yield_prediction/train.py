import os
import pandas as pd
import numpy as np
import time
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

# Load dataset
df = pd.read_csv("dataset/crop-yield.csv")
df.columns = df.columns.str.lower()
df = df[["crop_type", "rainfall", "temperature", "humidity", "wind_speed", "crop_yield_ton_per_hectare"]].dropna()
df = df[df["crop_yield_ton_per_hectare"] > 0]
print("✅ Dataset loaded successfully!")

#print dataset
print(f"Original Samples      : {len(df):,}")
print(f"Samples After Cleaning: {len(df):,}")
print(f"\n🌾 Unique Crops       : {df['crop_type'].nunique()}")
print("\nSupported Crops:")
print(sorted(df["crop_type"].unique()))

# Features
FEATURES = ["crop_type", "rainfall", "temperature", "humidity", "wind_speed"]
X = df[FEATURES]
y = df["crop_yield_ton_per_hectare"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"Training Samples : {len(X_train):,}")
print(f"Testing Samples  : {len(X_test):,}")

# Preprocessing
categorical_cols = ["crop_type"]
numerical_cols = ["rainfall", "temperature", "humidity", "wind_speed"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("num", "passthrough", numerical_cols)
    ]
)

# Model
model = RandomForestRegressor(
    n_estimators=300,
    max_depth=25,
    min_samples_leaf=5,
    random_state=42,
    n_jobs=-1,#use all available cpu
    verbose=2
)

pipe = Pipeline([
    ("prep", preprocessor),
    ("model", model)
])

# Train
print("\n🚜 Training Started...")
start = time.time()
pipe.fit(X_train, y_train)
end = time.time()
print("✅ Training Completed!")
print(f"⏱ Training Time : {end-start:.2f} seconds")

# Evaluate
preds = pipe.predict(X_test) #uses unseen data
mae = mean_absolute_error(y_test, preds)
rmse = np.sqrt(mean_squared_error(y_test, preds))
r2 = r2_score(y_test, preds)

print("\n📈 MODEL PERFORMANCE")
print(f"MAE  : {mae:.3f}")
print(f"RMSE : {rmse:.3f}")
print(f"R²   : {r2:.4f}")

# Save model into model folder
os.makedirs("model", exist_ok=True)
joblib.dump(pipe, "model/yield_model.pkl")
print("✅ Production model saved in model/yield_model.pkl")
