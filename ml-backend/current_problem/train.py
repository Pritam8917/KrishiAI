# ================== ML TRAINING CODE ==================

import os  # create folders, file handling
import json # save dictionary as json
import torch # main PyTorch library
import torch.nn as nn # neural network layers like Linear, Conv2d
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, Subset

# dataset collection paths
TRAIN_DIR = "dataset/plantvillage/train" # training data path
VAL_DIR = "dataset/plantvillage/val"  # validation data path
MODEL_DIR = "model" # where trained model will be saved

#set training parameters
IMG_SIZE = 224        # all images become 224x224
BATCH_SIZE = 16       # train 16 images at one time
EPOCHS = 10           # whole dataset passes 10 times
LR = 1e-4            # learning rate = speed of learning

# if True, only 100 samples per class will be used for faster training during development(Testing)
DEV_MODE = False      
MAX_SAMPLES_PER_CLASS = 100 # 100 images per class will be used in DEV_MODE

os.makedirs(MODEL_DIR, exist_ok=True) # create model directory if not exists

# check if GPU is available, else use CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu") 
print("Using device:", device)

# ---------------- TRANSFORMS/PREPROCESSING ----------------
train_transform = transforms.Compose([ 
    transforms.Resize((IMG_SIZE, IMG_SIZE)), # convert every image to 224x224
    transforms.RandomHorizontalFlip(), # randomly flip image horizontally for data augmentation
    transforms.RandomRotation(10), # randomly rotate image by 10 degrees for data augmentation
    transforms.ToTensor(), # convert image into numbers/tensor
    transforms.Normalize( # normalize pixel values for stable training
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

# ImageFolder reads folder names as class labels automatically
train_dataset = datasets.ImageFolder(TRAIN_DIR, transform=train_transform) 
val_dataset = datasets.ImageFolder(VAL_DIR, transform=val_transform)

# count total number of classes
num_classes = len(train_dataset.classes)
print(f"Found {num_classes} classes in training dataset")
# print("Classes found:", train_dataset.classes)

# ---------------- SAVE CLASS MAPPING ----------------
with open("class_mapping.json", "w") as f:
    json.dump(
        {i: cls for i, cls in enumerate(train_dataset.classes)},
        f,
        indent=2
    )

print("✅ class_mapping.json generated")
print("Before dev mode:", len(train_dataset))

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


# ================== CREATE BATCHES/Dataloader ==================
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
model.classifier[1] = nn.Linear(model.last_channel, num_classes)# replace last layer with new layer for our classes
model.to(device) # move model to GPU/CPU

# ================== LOSS + OPTIMIZER ==================
criterion = nn.CrossEntropyLoss() # compare prediction with actual answer(measure how wrong the model is)
optimizer = torch.optim.Adam(model.parameters(), lr=LR) # optimizer updates weights

# ---------------- TRAINING ----------------
for epoch in range(EPOCHS):
    print(f"\n🚀 Starting Epoch {epoch + 1}/{EPOCHS}")
    model.train() # set to training mode
    train_loss = 0.0

    for batch_idx, (imgs, labels) in enumerate(train_loader):
        if batch_idx == 0:
            print("✅ First batch loaded")
        if batch_idx % 100 == 0 and batch_idx > 0:
            print(f"   ...Processed {batch_idx * BATCH_SIZE} images")
            
        imgs, labels = imgs.to(device), labels.to(device)
        optimizer.zero_grad() # clear old gradients
        
        outputs = model(imgs)  # image enters neural network (Forward pass)
        
        loss = criterion(outputs, labels) # compare predicted vs actual (calculate loss)
        
        loss.backward() # calculate gradients (Backpropagation)[need to know what to fix in the model]
        
        optimizer.step() # update weights based on gradients(improve model)

        train_loss += loss.item() # store loss for this batch

    train_loss /= len(train_loader) # average training loss

    # ---------------- VALIDATION ----------------
    # check how well the model performs on unseen data (validation set)
    model.eval() # set to evaluation mode(test model on unseen data)
    correct, total, val_loss = 0, 0, 0.0
    
    # no learning during validation
    with torch.no_grad():
        for imgs, labels in val_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            outputs = model(imgs) 
            loss = criterion(outputs, labels)
            val_loss += loss.item()
            
            # Get predictions and calculate accuracy
            _, preds = torch.max(outputs, 1)
            total += labels.size(0) # count total samples
            correct += (preds == labels).sum().item() # count correct predictions
            
    # Calculate average validation loss and accuracy
    val_loss /= len(val_loader)
    val_acc = 100 * correct / total
    
    # print epoch summary
    print(
        f"Epoch [{epoch+1}/{EPOCHS}] | "
        f"Train Loss: {train_loss:.4f} | "
        f"Val Loss: {val_loss:.4f} | "
        f"Total Validation Samples: {total}, Correct Samples: {correct}, "
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

# weights are numbers inside a neural network that tell the model what is important in an image. High weights mean the model thinks that feature is important, low weights mean it is not important. The model learns these weights during training.