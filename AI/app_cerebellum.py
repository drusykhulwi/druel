# app_cerebellum.py
# Flask API for cerebellum segmentation and TCD measurement

import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import cv2
from fetal_cerebellum_diagnosis import build_unet, preprocess_image, calculate_tcd_from_mask

app = Flask(__name__)

# Load model on startup
MODEL_PATH = "./models/unet_cerebellum_seg.h5"
model = build_unet()
model.load_weights(MODEL_PATH)

# TCD reference data (gestational age in weeks -> expected TCD in mm)
TCD_REFERENCE = {
    18: 18,
    19: 19,
    20: 20,
    21: 21,
    22: 22,
    23: 23,
    24: 24
}

def is_tcd_normal(tcd_mm, gest_age_weeks):
    """Check if TCD measurement is within normal range for gestational age"""
    # Handle gestational ages outside our reference data
    if gest_age_weeks < 18:
        # Estimate based on rule of thumb: TCD ≈ gestational age
        expected_tcd = gest_age_weeks
    elif gest_age_weeks > 24:
        # Estimate based on rule of thumb: TCD ≈ gestational age
        expected_tcd = gest_age_weeks
    else:
        expected_tcd = TCD_REFERENCE[gest_age_weeks]
    
    # Allow for 2mm variation (+/-) from expected value
    return abs(tcd_mm - expected_tcd) <= 2

@app.route("/analyze-cerebellum", methods=["POST"])
def analyze_cerebellum():
    if "image" not in request.files or "gestationalAge" not in request.form:
        return jsonify({"error": "Missing image or gestational age"}), 400

    file = request.files["image"]
    gest_age_weeks = int(request.form["gestationalAge"])
    filename = secure_filename(file.filename)
    image_path = os.path.join("temp", filename)
    os.makedirs("temp", exist_ok=True)
    file.save(image_path)

    # Load and preprocess
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    input_img = preprocess_image(img).reshape(1, 128, 128, 1)
    predicted_mask = model.predict(input_img)[0].reshape(128, 128)

    tcd_mm, _, status = calculate_tcd_from_mask(
        predicted_mask, img, pixel_spacing=0.3, gest_age_weeks=gest_age_weeks
    )

    os.remove(image_path)  # cleanup

    if tcd_mm is None:
        return jsonify({"error": "Could not detect cerebellum"}), 500
    
    # New assessment and response formatting
    tcd_normal = is_tcd_normal(tcd_mm, gest_age_weeks)
    expected_tcd = TCD_REFERENCE.get(gest_age_weeks, gest_age_weeks)  # Use rule of thumb if outside reference
    
    result = {
        "assessment": "TCD normal" if tcd_normal else "TCD abnormal",
        "tcd_mm": round(tcd_mm, 2),
        "details": ""
    }
    
    if tcd_normal:
        result["details"] = f"TCD was {round(tcd_mm, 2)}mm which is within the normal range for {gest_age_weeks} weeks gestational age."
    else:
        abnormality_type = "low" if tcd_mm < expected_tcd else "high"
        result["details"] = f"TCD was {round(tcd_mm, 2)}mm which is outside normal range for {gest_age_weeks} weeks gestational age."
        
        if abnormality_type == "low":
            result["recommendation"] = "Please perform more tests to narrow down causes. Low TCD may indicate cerebellar hypoplasia, which can be associated with genetic syndromes (e.g., Dandy-Walker), infections, or ischemia."
        else:  # high
            result["recommendation"] = "Please perform more tests to narrow down causes. High TCD measurements are rare and might indicate advanced development, macrosomia, or misdated gestation."
    
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5001)