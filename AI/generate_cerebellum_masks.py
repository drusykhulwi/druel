# generate_cerebellum_masks.py
# Automatically generate masks for training U-Net on cerebellum segmentation

import os
import cv2
import numpy as np

# Folders
image_folder = "./dataset/Trans_cerebellum_images"
mask_folder = "./dataset/Trans_cerebellum_masks"
os.makedirs(mask_folder, exist_ok=True)

# Image size for resizing (U-Net input)
IMG_SIZE = (128, 128)

def generate_mask(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None

    # Resize for uniformity
    img = cv2.resize(img, IMG_SIZE)

    # Preprocessing: blur and contrast
    blurred = cv2.GaussianBlur(img, (5, 5), 0)
    equalized = cv2.equalizeHist(blurred)

    # Thresholding to highlight bright regions
    _, thresh = cv2.threshold(equalized, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Morphological cleaning
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)

    # Keep largest contour as cerebellum
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros_like(closed)
    if contours:
        largest = max(contours, key=cv2.contourArea)
        cv2.drawContours(mask, [largest], -1, 255, cv2.FILLED)

    return mask

# Run on all images
for fname in os.listdir(image_folder):
    if fname.endswith(".png"):
        image_path = os.path.join(image_folder, fname)
        mask = generate_mask(image_path)
        if mask is not None:
            save_path = os.path.join(mask_folder, fname)
            cv2.imwrite(save_path, mask)

print(f"Auto-generated masks saved to {mask_folder}")
