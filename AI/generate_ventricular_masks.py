# generate_ventricular_masks.py
# Automatically create segmentation masks for Trans-ventricular ultrasound images

import os
import cv2
import numpy as np

# Paths
image_folder = "./dataset/Trans_ventricular_images"
mask_folder = "./dataset/Trans_ventricular_masks"
os.makedirs(mask_folder, exist_ok=True)

IMG_SIZE = (128, 128)

def generate_mask(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None

    img = cv2.resize(img, IMG_SIZE)

    # Preprocessing: enhance contrast and reduce noise
    blurred = cv2.GaussianBlur(img, (5, 5), 0)
    equalized = cv2.equalizeHist(blurred)

    # Threshold to highlight bright ventricular areas
    _, thresh = cv2.threshold(equalized, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Morphological operations to clean up
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)

    # Keep largest 1-2 contours (usually lateral ventricles)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros_like(closed)
    sorted_contours = sorted(contours, key=cv2.contourArea, reverse=True)[:2]
    for cnt in sorted_contours:
        cv2.drawContours(mask, [cnt], -1, 255, cv2.FILLED)

    return mask

# Process all images
for fname in os.listdir(image_folder):
    if fname.endswith(".png"):
        img_path = os.path.join(image_folder, fname)
        mask = generate_mask(img_path)
        if mask is not None:
            save_path = os.path.join(mask_folder, fname)
            cv2.imwrite(save_path, mask)

print(f"Masks saved to {mask_folder}")
