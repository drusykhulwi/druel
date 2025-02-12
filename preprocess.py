import cv2
import numpy as np
import os

# Load and preprocess ultrasound images
def preprocess_image(image_path):
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)  # Convert to grayscale
    image = cv2.resize(image, (256, 256))  # Resize for model input
    image = image / 255.0  # Normalize pixel values
    return np.expand_dims(image, axis=-1)  # Add channel dimension

# Example usage
image_path = "./testimages/Patient00168_Plane6_1_of_4.png"
processed_image = preprocess_image(image_path)

if processed_image is not None:
    print(f"Preprocessed Image Shape: {processed_image.shape}")
else:
    print("Image preprocessing failed.")

