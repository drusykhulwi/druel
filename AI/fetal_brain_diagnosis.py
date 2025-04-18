# fetal_brain_diagnosis.py

import cv2
import numpy as np
import matplotlib.pyplot as plt
import os
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, UpSampling2D, concatenate
from tensorflow.keras.optimizers import Adam

# Same U-Net architecture as in training
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

def preprocess_image(img):
    # Add check to ensure image is not None
    if img is None:
        raise ValueError("Image is None")
        
    # Make sure image has correct dimensions
    if len(img.shape) == 3 and img.shape[2] > 1:
        # Convert to grayscale if it's a color image
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
    # Resize to model input size
    img = cv2.resize(img, (128, 128))
    
    # Enhance contrast
    img = cv2.equalizeHist(img)
    
    # Normalize to [0, 1]
    img = img / 255.0
    
    return img.reshape(128, 128, 1)

def generate_mask_from_image(original_img):
    """
    Generate a brain mask using traditional CV techniques similar to generate_masks.py
    """
    # Make sure image is the right size
    img_proc = cv2.resize(original_img, (128, 128))
    
    # Enhanced processing similar to generate_masks.py
    # Apply CLAHE for better contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_proc = clahe.apply(img_proc)
    
    # Gaussian blur to reduce noise
    blur = cv2.GaussianBlur(img_proc, (5, 5), 0)
    
    # Adaptive thresholding
    thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                  cv2.THRESH_BINARY_INV, 21, 5)
    
    # Morphological operations to clean up the mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    closing = cv2.morphologyEx(opening, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # Edge detection
    edges = cv2.Canny(blur, 30, 150)
    closed_edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    
    # Combine approaches
    combined = cv2.bitwise_or(closing, closed_edges)
    
    # Find contours
    contours, _ = cv2.findContours(combined, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Create empty mask
    binary_mask = np.zeros((128, 128), dtype=np.uint8)
    
    if contours:
        # Find the largest contour or combine all contours over a certain size
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        
        # Draw the largest contour as a filled shape
        cv2.drawContours(binary_mask, [contours[0]], -1, 1, thickness=cv2.FILLED)
        
        # Optional: Also include other large contours
        for i in range(1, min(3, len(contours))):
            if cv2.contourArea(contours[i]) > 100:  # Only include significant contours
                cv2.drawContours(binary_mask, [contours[i]], -1, 1, thickness=cv2.FILLED)
    
    # Final morphological cleanup
    binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # Save debug image
    os.makedirs("temp", exist_ok=True)
    cv2.imwrite("temp/debug_cv_generated_mask.png", binary_mask * 255)
    
    return binary_mask

def calculate_bpd_and_hc_from_mask(mask, original_img, pixel_spacing=0.3, gest_age_weeks=None):
    """
    Calculate BPD and HC from a segmentation mask
    """
    os.makedirs("temp", exist_ok=True)
    
    try:
        # First, save the raw prediction
        cv2.imwrite("temp/debug_raw_prediction.png", (mask * 255).astype(np.uint8))
        
        # Print raw prediction stats
        print(f"Raw prediction - Min: {np.min(mask):.4f}, Max: {np.max(mask):.4f}, Mean: {np.mean(mask):.4f}")
        
        # Try multiple thresholds
        thresholds = [0.5, 0.25, 0.1, 0.05]
        binary_mask = None
        
        for threshold in thresholds:
            temp_mask = (mask > threshold).astype(np.uint8)
            mask_sum = np.sum(temp_mask)
            print(f"Threshold {threshold} - Sum: {mask_sum}, Max: {np.max(temp_mask)}")
            
            # Save this threshold attempt
            cv2.imwrite(f"temp/debug_threshold_{threshold}.png", temp_mask * 255)
            
            # If we have enough pixels, use this mask
            if mask_sum > 200:  # Need a reasonable number of pixels
                binary_mask = temp_mask
                print(f"Using threshold {threshold}")
                break
        
        # If model prediction is too weak, fall back to traditional CV techniques
        if binary_mask is None or np.sum(binary_mask) < 200:
            print("Model prediction too weak, falling back to traditional CV techniques")
            binary_mask = generate_mask_from_image(original_img)
            
        # Save final binary mask
        cv2.imwrite("temp/debug_final_binary_mask.png", binary_mask * 255)
        
        # Find contours in the binary mask
        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        print(f"Found {len(contours)} contours in mask")
        
        if not contours:
            print("No contours found in the mask")
            return None, None, None, None, original_img
            
        # Get the largest contour by area
        largest = max(contours, key=cv2.contourArea)
        print(f"Largest contour has {len(largest)} points and area {cv2.contourArea(largest)}")
        
        # Need at least 5 points to fit an ellipse
        if len(largest) < 5:
            print("Largest contour has too few points for ellipse fitting")
            return None, None, None, None, original_img
            
        # Fit ellipse to the largest contour
        ellipse = cv2.fitEllipse(largest)
        (x, y), (major, minor), angle = ellipse
        
        # Convert from pixels to mm using pixel_spacing
        bpd_mm = minor * pixel_spacing
        hc_mm = np.pi * ((major + minor) / 2) * pixel_spacing
        
        print(f"Calculated BPD: {bpd_mm:.2f}mm, HC: {hc_mm:.2f}mm")
        
        # Create a copy of original_img for annotation
        if len(original_img.shape) == 2:  # If grayscale
            annotated = cv2.cvtColor(original_img, cv2.COLOR_GRAY2BGR)
        else:
            annotated = original_img.copy()
            
        # Draw ellipse and measurements on the image
        cv2.ellipse(annotated, ellipse, (0, 255, 0), 2)
        cv2.putText(annotated, f"BPD: {bpd_mm:.1f}mm", (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        cv2.putText(annotated, f"HC: {hc_mm:.1f}mm", (10, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        
        # Save annotated image
        cv2.imwrite("temp/debug_annotated.png", annotated)
        
        # Return values as required by app.py
        return bpd_mm, hc_mm, ellipse, (x, y), annotated
        
    except Exception as e:
        print(f"Error in calculate_bpd_and_hc_from_mask: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, None, None, None, original_img
    
def run_bpd_hc_analysis(image_path, model):
    """
    Test function for when this script is run directly
    """
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print(f"Image not found at path: {image_path}")
        return
        
    try:
        input_img = preprocess_image(img).reshape(1, 128, 128, 1)
        predicted_mask = model.predict(input_img)[0].reshape(128, 128)
        
        # Match the return values expected here
        bpd, hc, ellipse, center, annotated = calculate_bpd_and_hc_from_mask(predicted_mask, img)
        
        if bpd is None or hc is None:
            print("Failed to calculate BPD or HC measurements.")
            return
            
        plt.imshow(cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB))
        plt.title(f"BPD: {bpd:.1f}mm, HC: {hc:.1f}mm")
        plt.axis('off')
        plt.show()
        
    except Exception as e:
        print(f"Error in analysis: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    model = build_unet()
    model.load_weights("unet_brain_seg.h5")  # load the model trained in train_model.py
    run_bpd_hc_analysis("./dataset/test_trans_thalamic.png", model)