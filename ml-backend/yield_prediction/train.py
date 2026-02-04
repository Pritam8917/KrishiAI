import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

# Load dataset
df = pd.read_csv("dataset/crop_production.csv")
df.columns = df.columns.str.lower()
df = df[["crop_name", "district_name", "area", "yield"]].dropna()
df = df[df["area"] > 0]

# Features
FEATURES = ["crop_name", "district_name", "area"]
X = df[FEATURES]
y = df["yield"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Preprocessing
categorical_cols = ["crop_name", "district_name"]
numerical_cols = ["area"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("num", "passthrough", numerical_cols)
    ]
)

# Model
model = RandomForestRegressor(
    n_estimators=120,
    max_depth=15,
    min_samples_leaf=5,
    random_state=42,
    n_jobs=-1,
    verbose=1
)

pipe = Pipeline([
    ("prep", preprocessor),
    ("model", model)
])

# Train
print("🚜 Training started...")
pipe.fit(X_train, y_train)
print("✅ Training completed!")

# Evaluate
preds = pipe.predict(X_test)
mae = mean_absolute_error(y_test, preds)
rmse = np.sqrt(mean_squared_error(y_test, preds))
r2 = r2_score(y_test, preds)

print("MAE:", round(mae, 3))
print("RMSE:", round(rmse, 3))
print("R2:", round(r2, 3))

# Save model into model folder
os.makedirs("model", exist_ok=True)
joblib.dump(pipe, "model/yield_model.pkl")
print("✅ Production model saved in model/yield_model.pkl")
