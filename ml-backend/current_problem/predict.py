# local test file for prediction function
import torch
from torchvision import models, transforms
from PIL import Image
import json
import os

MODEL_PATH = "model/plant_model.pt"

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
model.eval() # set to evaluation mode

# ---------------- TRANSFORMS ----------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),  
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ---------------- PREDICT FUNCTION ----------------
def predict(image_path: str):
    img = Image.open(image_path).convert("RGB")
    img = transform(img).unsqueeze(0).to(device) # add batch dimension

    with torch.no_grad(): # That one line separates inference from training.
        outputs = model(img)
        probs = torch.softmax(outputs, dim=1)
        idx = probs.argmax(1).item()
        confidence = probs[0][idx].item()

    return {
        "prediction": CLASS_NAMES[idx],
        "confidence": round(confidence * 100, 2)
    }


# ---------------- TEST ----------------
if __name__ == "__main__":
    result = predict("dataset/PlantVillage/train/Blueberry___healthy/0c7b9ac5-8174-4dbe-9cc3-043b920ec276___RS_HL 2290.JPG")  # put a test image path here
    print(result)
