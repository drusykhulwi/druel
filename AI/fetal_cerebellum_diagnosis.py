# fetal_cerebellum_diagnosis.py
# Use trained cerebellum U-Net model to measure TCD from new ultrasound image

import cv2
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from train_cerebellum_model import build_unet, preprocess_image
import math

# ---------------- Reference Range ----------------
def tcd_reference_range(ga_weeks):
    return ga_weeks  # Approx: TCD(mm) ~= Gestational Age (weeks)

# ---------------- TCD Measurement ----------------
def calculate_tcd_from_mask(mask, original_img, pixel_spacing=0.3, gest_age_weeks=24):
    mask = (mask > 0.5).astype(np.uint8)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours or len(contours) < 1:
        return None, original_img, "No cerebellum detected"

    largest = max(contours, key=cv2.contourArea)
    ellipse = cv2.fitEllipse(largest)
    (x, y), (major, minor), angle = ellipse

    tcd_mm = major * pixel_spacing  # Assuming major axis across cerebellar lobes
    expected = tcd_reference_range(gest_age_weeks)

    status = "Normal" if abs(tcd_mm - expected) <= 3 else "Abnormal"

    annotated = cv2.cvtColor(original_img, cv2.COLOR_GRAY2BGR)
    cv2.ellipse(annotated, ellipse, (0, 255, 0), 2)
    cv2.putText(annotated, f"TCD: {tcd_mm:.1f}mm ({status})", (10, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

    return tcd_mm, annotated, status

# ---------------- Run Inference ----------------
def run_tcd_analysis(image_path, model_path, gest_age_weeks):
    model = build_unet()
    model.load_weights(model_path)

    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None, None, "Image not found"

    input_img = preprocess_image(img).reshape(1, 128, 128, 1)
    predicted_mask = model.predict(input_img)[0].reshape(128, 128)

    tcd_mm, annotated_img, status = calculate_tcd_from_mask(
        predicted_mask, img, pixel_spacing=0.3, gest_age_weeks=gest_age_weeks
    )

    # Display annotated image
    plt.imshow(cv2.cvtColor(annotated_img, cv2.COLOR_BGR2RGB))
    plt.title(f"TCD: {tcd_mm:.1f}mm ({status})")
    plt.axis('off')
    plt.show()

    return {
        "tcd_mm": round(tcd_mm, 2),
        "status": status
    }

if __name__ == "__main__":
    image_path = "./dataset/test_trans_cerebellum.png"
    model_path = "./models/unet_cerebellum_seg.h5"
    gest_age_weeks = int(input("Enter gestational age in weeks: "))

    result = run_tcd_analysis(image_path, model_path, gest_age_weeks)
    print(result)
