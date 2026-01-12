# Inference logic
import torch
from torchvision import models, transforms
from PIL import Image
import json

MODEL_PATH = "model/plant_model.pt"
CLASS_NAMES = json.load(open("class_mapping.json"))

device = torch.device("cuda" if torch.cuda.is_available() else "cpu") 

model = models.mobilenet_v2(pretrained=False)
model.classifier[1] = torch.nn.Linear(
    model.last_channel, len(CLASS_NAMES)
)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device)) 
model.eval()

#image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Normalize(
    mean=[0.485, 0.456, 0.406],
    std=[0.229, 0.224, 0.225]
)

])

# Define prediction function
def predict(image_path):
    img = Image.open(image_path).convert("RGB")
    img = transform(img).unsqueeze(0)
    with torch.no_grad():
        out = model(img)
        idx = out.argmax(1).item()
    return CLASS_NAMES[str(idx)]
