 # Train, evaluate, and save model
 # model/train_model.py
import os
import numpy as np
import cv2
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.callbacks import ModelCheckpoint
import matplotlib.pyplot as plt
import pandas as pd
from model_cnn import create_cnn

# --- 1. Load preprocessed metadata ---
data_file = "../dataset/FETAL_PLANES_DB_data.csv"
image_dir = "../dataset/Images/"
df = pd.read_csv(data_file, delimiter=';', encoding='latin1')

# --- 2. Preprocess images and labels ---
df['Image_name'] = df['Image_name'].str.strip()  # Ensure clean filenames

images = []
labels = []

for index, row in df.iterrows():
    img_path = os.path.join(image_dir, row['Image_name'])
    if os.path.exists(img_path):
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        img = cv2.resize(img, (224, 224))
        img = img / 255.0
        images.append(img)
        
        # Assuming anomaly classification: 1 = anomaly, 0 = normal
        label = 1 if row['Plane'] == 'Anomalous' else 0  # <- Update logic based on your dataset
        labels.append(label)

images = np.array(images).reshape(-1, 224, 224, 1)
labels = np.array(labels)

# --- 3. Train-test split ---
X_train, X_test, y_train, y_test = train_test_split(images, labels, test_size=0.2, random_state=42)

# --- 4. Load model ---
model = create_cnn()

# --- 5. Model Checkpointing ---
checkpoint = ModelCheckpoint("../saved_model/best_model.h5", monitor='val_accuracy', save_best_only=True)

# --- 6. Train the model ---
history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=15,
    batch_size=32,
    callbacks=[checkpoint]
)

# --- 7. Save final model ---
model.save("../saved_model/final_model.h5")

# --- 8. Plot training metrics ---
plt.plot(history.history['accuracy'], label="Train Acc")
plt.plot(history.history['val_accuracy'], label="Val Acc")
plt.legend()
plt.title("Model Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.show()
