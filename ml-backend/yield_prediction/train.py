import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error

# -----------------------------
# Load dataset
# -----------------------------
df = pd.read_csv("crop_production.csv")
df.columns = df.columns.str.lower()

# Keep only required columns
df = df[
    ["crop_name", "season", "district_name", "area", "yield"]
].dropna()

df = df[df["area"] > 0]

# -----------------------------
# Encode categorical features
# -----------------------------
encoders = {}
categorical_cols = ["crop_name", "season", "district_name"]

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# -----------------------------
# Train-test split
# -----------------------------
FEATURES = ["crop_name", "season", "district_name", "area"]
X = df[FEATURES]
y = df["yield"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# Train model
# -----------------------------
model = RandomForestRegressor(
    n_estimators=300,
    random_state=42
)
model.fit(X_train, y_train)

# -----------------------------
# Evaluate
# -----------------------------
preds = model.predict(X_test)
mae = mean_absolute_error(y_test, preds)
print("MAE:", round(mae, 3))

# -----------------------------
# Save model bundle
# -----------------------------
bundle = {
    "model": model,
    "encoders": encoders,
    "features": FEATURES
}

joblib.dump(bundle, "yield_model.pkl")
print("✅ Model saved as yield_model.pkl")
