# fetal_ventricular_diagnosis.py
# Use trained model to segment lateral ventricles and measure their width (LVW)

import cv2
import numpy as np
import matplotlib.pyplot as plt
from train_ventricular_model import build_unet, preprocess_image

# Reference Range
def lvw_reference_range(ga_weeks):
    # Typically <10mm is normal; varies by GA
    return 10.0

# Measurement
def calculate_lvw_from_mask(mask, original_img, pixel_spacing=0.3, gest_age_weeks=24):
    mask = (mask > 0.5).astype(np.uint8)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return None, original_img, "No ventricles detected"

    largest = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)

    lvw_mm = w * pixel_spacing
    expected = lvw_reference_range(gest_age_weeks)
    status = "Normal" if lvw_mm <= expected else "Abnormal"

    annotated = cv2.cvtColor(original_img, cv2.COLOR_GRAY2BGR)
    cv2.rectangle(annotated, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv2.putText(annotated, f"LVW: {lvw_mm:.1f}mm ({status})", (10, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

    return lvw_mm, annotated, status

# ---------------- Inference ----------------
def run_lvw_analysis(image_path, model_path, gest_age_weeks):
    model = build_unet()
    model.load_weights(model_path)

    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None, None, "Image not found"

    input_img = preprocess_image(img).reshape(1, 128, 128, 1)
    predicted_mask = model.predict(input_img)[0].reshape(128, 128)

    lvw_mm, annotated_img, status = calculate_lvw_from_mask(
        predicted_mask, img, pixel_spacing=0.3, gest_age_weeks=gest_age_weeks
    )

    plt.imshow(cv2.cvtColor(annotated_img, cv2.COLOR_BGR2RGB))
    plt.title(f"LV Width: {lvw_mm:.1f}mm ({status})")
    plt.axis('off')
    plt.show()

    return {
        "lvw_mm": round(lvw_mm, 2),
        "status": status
    }

if __name__ == "__main__":
    image_path = "./dataset/test_trans_ventricular.png"
    model_path = "./models/unet_ventricular_seg.h5"
    gest_age_weeks = int(input("Enter gestational age in weeks: "))

    result = run_lvw_analysis(image_path, model_path, gest_age_weeks)
    print(result)
