# train_cerebellum_model.py
# Trains a U-Net model on trans-cerebellum images + auto-generated masks

import os
import cv2
import numpy as np
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, UpSampling2D, concatenate
from tensorflow.keras.callbacks import ModelCheckpoint
from tensorflow.keras.optimizers import Adam

# Paths
IMAGE_FOLDER = "./dataset/Trans_cerebellum_images"
MASK_FOLDER = "./dataset/Trans_cerebellum_masks"
MODEL_PATH = "./models/unet_cerebellum_seg.h5"
IMG_SIZE = (128, 128)

# ---------------- U-Net Architecture ----------------
def build_unet(input_size=(128, 128, 1)):
    inputs = Input(input_size)

    c1 = Conv2D(64, 3, activation='relu', padding='same')(inputs)
    c1 = Conv2D(64, 3, activation='relu', padding='same')(c1)
    p1 = MaxPooling2D()(c1)

    c2 = Conv2D(128, 3, activation='relu', padding='same')(p1)
    c2 = Conv2D(128, 3, activation='relu', padding='same')(c2)
    p2 = MaxPooling2D()(c2)

    c3 = Conv2D(256, 3, activation='relu', padding='same')(p2)
    c3 = Conv2D(256, 3, activation='relu', padding='same')(c3)

    u1 = UpSampling2D()(c3)
    u1 = concatenate([u1, c2])
    c4 = Conv2D(128, 3, activation='relu', padding='same')(u1)
    c4 = Conv2D(128, 3, activation='relu', padding='same')(c4)

    u2 = UpSampling2D()(c4)
    u2 = concatenate([u2, c1])
    c5 = Conv2D(64, 3, activation='relu', padding='same')(u2)
    c5 = Conv2D(64, 3, activation='relu', padding='same')(c5)

    outputs = Conv2D(1, 1, activation='sigmoid')(c5)

    model = Model(inputs, outputs)
    model.compile(optimizer=Adam(), loss='binary_crossentropy', metrics=['accuracy'])
    return model

# ---------------- Preprocessing ----------------
def preprocess_image(img):
    img = cv2.resize(img, IMG_SIZE)
    img = cv2.equalizeHist(img)
    img = img / 255.0
    return img.reshape(128, 128, 1)

# ---------------- Load Data ----------------
def load_data():
    X, y = [], []
    for fname in os.listdir(IMAGE_FOLDER):
        img_path = os.path.join(IMAGE_FOLDER, fname)
        mask_path = os.path.join(MASK_FOLDER, fname)

        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)

        if img is None or mask is None:
            continue

        X.append(preprocess_image(img))
        y.append(preprocess_image(mask))

    return np.array(X), np.array(y)

# ---------------- Train Model ----------------
def train_model():
    X, y = load_data()
    model = build_unet()
    checkpoint = ModelCheckpoint(MODEL_PATH, monitor='val_loss', save_best_only=True)
    model.fit(X, y, validation_split=0.2, epochs=20, batch_size=8, callbacks=[checkpoint])
    print(f"Model trained and saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
