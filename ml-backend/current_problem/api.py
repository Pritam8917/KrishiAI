# FastAPI logic

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
from torchvision import models, transforms
from PIL import Image
import io
import os

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- PATHS ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "plant_model.pt")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------------- LOAD CHECKPOINT ----------------
checkpoint = torch.load(MODEL_PATH, map_location=device)

CLASS_NAMES = checkpoint["class_names"]
NUM_CLASSES = checkpoint["num_classes"]

# ---------------- MODEL ----------------
model = models.mobilenet_v2(weights=None)
model.classifier[1] = torch.nn.Linear(
    model.last_channel, NUM_CLASSES
)

model.load_state_dict(checkpoint["model_state"])
model.to(device)
model.eval()

# ---------------- TRANSFORMS (MUST MATCH TRAINING) ----------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ---------------- API ----------------
@app.post("/predict")

async def predict(image: UploadFile = File(...)): # Receive image file
    image_bytes = await image.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(img)
        probs = torch.softmax(outputs, dim=1)
        idx = probs.argmax(1).item()
        confidence = probs[0][idx].item()

    return {
        "prediction": CLASS_NAMES[idx],
        "confidence": round(confidence * 100, 2)
    }
