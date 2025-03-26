import cv2
import numpy as np
from tensorflow.keras.models import load_model

# Load trained model
model = load_model("saved_model.h5")

# Load and preprocess test image
def preprocess_image(image_path):
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    image = cv2.resize(image, (256, 256))
    image = np.expand_dims(image, axis=(0, -1))  # Reshape for model input
    return image / 255.0  # Normalize pixel values

test_image = preprocess_image("dataset/test_ultrasound.jpg")

# Predict class
prediction = model.predict(test_image)
predicted_class = np.argmax(prediction)

# Output result
print(f"Predicted Class: {'Normal' if predicted_class == 0 else 'Abnormal'}")
