import os
import cv2
import numpy as np

image_folder = './dataset/Trans_thalamic_images'
mask_folder = './dataset/Trans_thalamic_masks'

os.makedirs(mask_folder, exist_ok=True)

def generate_mask(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None

    # Resize to consistent shape
    img = cv2.resize(img, (128, 128))
    
    # Enhance and blur
    blur = cv2.GaussianBlur(img, (5, 5), 0)
    
    # Detect edges
    edges = cv2.Canny(blur, 30, 150)
    
    # Morphological closing
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    
    # Find contours and fill the largest one
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros_like(img)
    
    if contours:
        largest = max(contours, key=cv2.contourArea)
        cv2.drawContours(mask, [largest], -1, 255, thickness=cv2.FILLED)

    return mask

# Run through all images
for filename in os.listdir(image_folder):
    if filename.endswith('.png'):
        img_path = os.path.join(image_folder, filename)
        mask = generate_mask(img_path)

        if mask is not None:
            save_path = os.path.join(mask_folder, filename)
            cv2.imwrite(save_path, mask)

print(f"Masks generated for all images and added to {mask_folder}")
