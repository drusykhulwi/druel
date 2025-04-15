# app.py (Flask API for Fetal Brain Analysis)

import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from fetal_brain_diagnosis import preprocess_image, build_unet, calculate_bpd_and_hc_from_mask

app = Flask(__name__)

# Load trained model once
model = build_unet()
model.load_weights("./models/unet_brain_seg.h5")

# Reference measurements for gestational ages 18-24 weeks
REFERENCE_DATA = {
    18: {"hc": 145, "bpd": 42},
    19: {"hc": 155, "bpd": 45},
    20: {"hc": 170, "bpd": 48},
    21: {"hc": 180, "bpd": 50},
    22: {"hc": 190, "bpd": 53},
    23: {"hc": 200, "bpd": 56},
    24: {"hc": 210, "bpd": 59}
}

# Tolerance range (±10%) for normal measurements
TOLERANCE = 0.10

def evaluate_measurement(value, reference, measurement_type, gest_age):
    """
    Evaluate if measurement is within normal range and generate detailed assessment
    """
    lower_bound = reference * (1 - TOLERANCE)
    upper_bound = reference * (1 + TOLERANCE)
    
    is_normal = lower_bound <= value <= upper_bound
    
    # Generate detailed assessment
    if is_normal:
        status = "normal"
        detail = f"{measurement_type} was {value:.2f} mm which is within the normal range for {gest_age} weeks GA."
    else:
        status = "abnormal"
        if value < lower_bound:
            if measurement_type == "BPD":
                detail = (f"{measurement_type} was {value:.2f} mm which is below normal range for {gest_age} weeks GA. "
                          f"This may indicate microcephaly or dolichocephaly (elongated head). "
                          f"Please conduct additional tests to evaluate potential causes such as "
                          f"fetal growth restriction, congenital infections, or genetic abnormalities.")
            else:  # HC
                detail = (f"{measurement_type} was {value:.2f} mm which is below normal range for {gest_age} weeks GA. "
                          f"This may indicate microcephaly. Possible causes include congenital infections (e.g., Zika, CMV), "
                          f"genetic syndromes, fetal alcohol syndrome, or severe IUGR. "
                          f"Please conduct additional tests for further evaluation.")
        else:  # value > upper_bound
            if measurement_type == "BPD":
                detail = (f"{measurement_type} was {value:.2f} mm which is above normal range for {gest_age} weeks GA. "
                          f"This may indicate macrosomia or brachycephaly. "
                          f"Common in maternal diabetes; might complicate delivery. "
                          f"Please conduct additional tests for further evaluation.")
            else:  # HC
                detail = (f"{measurement_type} was {value:.2f} mm which is above normal range for {gest_age} weeks GA. "
                          f"This may indicate macrocephaly or hydrocephalus. Possible causes include "
                          f"enlarged ventricles, genetic syndromes, brain malformations, or benign familial macrocephaly. "
                          f"Please conduct additional tests for further evaluation.")
    
    return status, detail

@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files or "gestationalAge" not in request.form:
        return jsonify({"error": "Missing image or gestational age"}), 400

    file = request.files["image"]
    gest_age_weeks = int(request.form["gestationalAge"])
    
    # Check if gestational age is in our reference range
    if gest_age_weeks < 18 or gest_age_weeks > 24:
        return jsonify({"error": "Gestational age must be between 18-24 weeks"}), 400
    
    filename = secure_filename(file.filename)
    image_path = os.path.join("temp", filename)
    os.makedirs("temp", exist_ok=True)
    file.save(image_path)

    # Read image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    input_img = preprocess_image(img).reshape(1, 128, 128, 1)
    predicted_mask = model.predict(input_img)[0].reshape(128, 128)

    bpd, hc, _, _, _ = calculate_bpd_and_hc_from_mask(
        predicted_mask, img, pixel_spacing=0.3, gest_age_weeks=gest_age_weeks)

    os.remove(image_path)  # clean up temp

    if bpd is None or hc is None:
        return jsonify({"error": "Could not analyze image"}), 500
    
    # Get reference values for the gestational age
    reference = REFERENCE_DATA[gest_age_weeks]
    
    # Evaluate measurements
    bpd_status, bpd_detail = evaluate_measurement(bpd, reference["bpd"], "BPD", gest_age_weeks)
    hc_status, hc_detail = evaluate_measurement(hc, reference["hc"], "HC", gest_age_weeks)
    
    # Generate summary message
    if bpd_status == "normal" and hc_status == "normal":
        summary = "BPD and HC measurements are normal."
    elif bpd_status == "abnormal" and hc_status == "abnormal":
        summary = "Both BPD and HC measurements are abnormal."
    elif bpd_status == "abnormal":
        summary = "BPD measurement is abnormal while HC is normal."
    else:  # hc_status == "abnormal"
        summary = "HC measurement is abnormal while BPD is normal."

    return jsonify({
        "summary": summary,
        "bpd_mm": round(bpd, 2),
        "hc_mm": round(hc, 2),
        "bpd_status": bpd_status,
        "hc_status": hc_status,
        "bpd_detail": bpd_detail,
        "hc_detail": hc_detail
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)