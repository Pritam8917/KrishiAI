# ================== ML TRAINING CODE (WINDOWS SAFE) ==================

import os
import json
import torch
import torch.nn as nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, Subset

# ---------------- CONFIG ----------------
TRAIN_DIR = "dataset/plantvillage/train" # training data path
VAL_DIR = "dataset/plantvillage/val"  # validation data path
MODEL_DIR = "model" 

IMG_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 2            # DEV MODE
LR = 1e-4

DEV_MODE = True       # switch OFF for final training
MAX_SAMPLES_PER_CLASS = 100
# --------------------------------------

os.makedirs(MODEL_DIR, exist_ok=True) # create model directory if not exists

device = torch.device("cuda" if torch.cuda.is_available() else "cpu") 
print("Using device:", device)

# ---------------- TRANSFORMS ----------------
train_transform = transforms.Compose([ 
    transforms.Resize((IMG_SIZE, IMG_SIZE)), # 224*224
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

val_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ---------------- LOAD DATASETS ----------------
train_dataset = datasets.ImageFolder(TRAIN_DIR, transform=train_transform)
val_dataset = datasets.ImageFolder(VAL_DIR, transform=val_transform)

num_classes = len(train_dataset.classes)
print("Classes found:", train_dataset.classes)

# ---------------- SAVE CLASS MAPPING ----------------
with open("class_mapping.json", "w") as f:
    json.dump(
        {i: cls for i, cls in enumerate(train_dataset.classes)},
        f,
        indent=2
    )

print("✅ class_mapping.json generated")

# ---------------- DEV MODE REDUCTION ----------------
if DEV_MODE:
    indices = []
    class_counts = {i: 0 for i in range(num_classes)}

    for idx, (_, label) in enumerate(train_dataset.samples):
        if class_counts[label] < MAX_SAMPLES_PER_CLASS:
            indices.append(idx)
            class_counts[label] += 1

    train_dataset = Subset(train_dataset, indices)
    print(f"⚡ DEV MODE ENABLED → {len(train_dataset)} images used")

# ---------------- DATALOADERS (WINDOWS SAFE) ----------------
train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0,
    pin_memory=False
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE, 
    shuffle=False,
    num_workers=0,
    pin_memory=False
)

# ---------------- MODEL ----------------
model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
model.classifier[1] = nn.Linear(model.last_channel, num_classes)
model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LR)

# ---------------- TRAINING ----------------
for epoch in range(EPOCHS):
    print(f"\n🚀 Starting Epoch {epoch + 1}/{EPOCHS}")
    model.train()
    train_loss = 0.0

    for batch_idx, (imgs, labels) in enumerate(train_loader):
        if batch_idx == 0:
            print("✅ First batch loaded")
        if batch_idx % 100 == 0 and batch_idx > 0:
            print(f"   ...Processed {batch_idx * BATCH_SIZE} images")
            
        imgs, labels = imgs.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        train_loss += loss.item()

    train_loss /= len(train_loader)

    # ---------------- VALIDATION ----------------
    model.eval()
    correct, total, val_loss = 0, 0, 0.0

    with torch.no_grad():
        for imgs, labels in val_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            val_loss += loss.item()

            _, preds = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (preds == labels).sum().item()

    val_loss /= len(val_loader)
    val_acc = 100 * correct / total

    print(
        f"Epoch [{epoch+1}/{EPOCHS}] | "
        f"Train Loss: {train_loss:.4f} | "
        f"Val Loss: {val_loss:.4f} | "
        f"Val Acc: {val_acc:.2f}%"
    )

# ---------------- SAVE MODEL ----------------
MODEL_PATH = os.path.join(MODEL_DIR, "plant_model.pt")

torch.save(
    {
        "model_state": model.state_dict(),
        "num_classes": num_classes,
        "class_names": train_dataset.dataset.classes
        if isinstance(train_dataset, Subset)
        else train_dataset.classes,
    },
    MODEL_PATH
)

print("\n✅ Model saved successfully!")
print("📦 File size (MB):", round(os.path.getsize(MODEL_PATH) / (1024 * 1024), 2))
