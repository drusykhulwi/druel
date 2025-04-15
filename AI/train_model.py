# train_model.py

import os
import numpy as np
import cv2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, UpSampling2D, concatenate
from tensorflow.keras.callbacks import ModelCheckpoint
from tensorflow.keras.optimizers import Adam

# U-Net Architecture
def build_unet(input_size=(128, 128, 1)):
    inputs = Input(input_size)
    c1 = Conv2D(64, (3, 3), activation='relu', padding='same')(inputs)
    c1 = Conv2D(64, (3, 3), activation='relu', padding='same')(c1)
    p1 = MaxPooling2D((2, 2))(c1)
    c2 = Conv2D(128, (3, 3), activation='relu', padding='same')(p1)
    c2 = Conv2D(128, (3, 3), activation='relu', padding='same')(c2)
    p2 = MaxPooling2D((2, 2))(c2)
    c3 = Conv2D(256, (3, 3), activation='relu', padding='same')(p2)
    c3 = Conv2D(256, (3, 3), activation='relu', padding='same')(c3)
    u1 = UpSampling2D((2, 2))(c3)
    u1 = concatenate([u1, c2])
    c4 = Conv2D(128, (3, 3), activation='relu', padding='same')(u1)
    c4 = Conv2D(128, (3, 3), activation='relu', padding='same')(c4)
    u2 = UpSampling2D((2, 2))(c4)
    u2 = concatenate([u2, c1])
    c5 = Conv2D(64, (3, 3), activation='relu', padding='same')(u2)
    c5 = Conv2D(64, (3, 3), activation='relu', padding='same')(c5)
    outputs = Conv2D(1, (1, 1), activation='sigmoid')(c5)
    model = Model(inputs, outputs)
    model.compile(optimizer=Adam(), loss='binary_crossentropy', metrics=['accuracy'])
    return model

# Preprocessing
def preprocess_image(img):
    img = cv2.resize(img, (128, 128))
    img = cv2.equalizeHist(img)
    img = img / 255.0
    return img.reshape(128, 128, 1)

# Load Data
def load_training_data(image_folder, mask_folder):
    X, y = [], []
    for fname in os.listdir(image_folder):
        if fname.endswith(".png"):
            img_path = os.path.join(image_folder, fname)
            mask_path = os.path.join(mask_folder, fname)
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
            if img is None or mask is None:
                continue
            X.append(preprocess_image(img))
            y.append(preprocess_image(mask))
    return np.array(X), np.array(y)

# Train Model
def train_unet_model(image_folder, mask_folder):
    X, y = load_training_data(image_folder, mask_folder)
    model = build_unet()
    checkpoint = ModelCheckpoint("./models/unet_brain_seg.h5", monitor='val_loss', save_best_only=True)
    model.fit(X, y, validation_split=0.2, epochs=20, batch_size=8, callbacks=[checkpoint])
    return model

# Run Training
if __name__ == "__main__":
    train_unet_model("./dataset/Trans_thalamic_images", "./dataset/Trans_thalamic_masks")
