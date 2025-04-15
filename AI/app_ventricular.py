# app_ventricular.py
# Flask API for lateral ventricular width (LVW) measurement and analysis

import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import cv2
from fetal_ventricular_diagnosis import build_unet, preprocess_image, calculate_lvw_from_mask

app = Flask(__name__)

# Load model at startup
MODEL_PATH = "./models/unet_ventricular_seg.h5"
model = build_unet()
model.load_weights(MODEL_PATH)

# Define normal ranges based on gestational age
def get_normal_ranges(gest_age_weeks):
    normal_ranges = {
        18: {"HC": 145, "BPD": 42, "TCD": 18, "LVW_max": 10},
        19: {"HC": 155, "BPD": 45, "TCD": 19, "LVW_max": 10},
        20: {"HC": 170, "BPD": 48, "TCD": 20, "LVW_max": 10},
        21: {"HC": 180, "BPD": 50, "TCD": 21, "LVW_max": 10},
        22: {"HC": 190, "BPD": 53, "TCD": 22, "LVW_max": 10},
        23: {"HC": 200, "BPD": 56, "TCD": 23, "LVW_max": 10},
        24: {"HC": 210, "BPD": 59, "TCD": 24, "LVW_max": 10},
    }
    
    # If gestational age is outside our table, use closest value
    if gest_age_weeks < 18:
        return normal_ranges[18]
    elif gest_age_weeks > 24:
        return normal_ranges[24]
    else:
        return normal_ranges[gest_age_weeks]

def analyze_lvw(lvw_mm, gest_age_weeks):
    normal_range = get_normal_ranges(gest_age_weeks)
    lvw_max = normal_range["LVW_max"]
    
    if lvw_mm < lvw_max:
        status = "normal"
        summary = "LVW measurement was normal"
        details = f"The LVW measurement was {lvw_mm}mm which is within the normal range (<{lvw_max}mm) for gestational age {gest_age_weeks} weeks."
        recommendation = "Continue with routine prenatal care and monitoring."
    else:
        status = "abnormal"
        summary = "LVW measurement was abnormal"
        
        # Categorize severity
        if lvw_mm >= 10 and lvw_mm < 12:
            severity = "mild ventriculomegaly"
            prognosis = "Mild ventriculomegaly may resolve spontaneously and often has normal outcomes. Follow-up ultrasound recommended."
        elif lvw_mm >= 12:
            severity = "moderate to severe ventriculomegaly"
            prognosis = "Moderate to severe ventriculomegaly may be associated with neurodevelopmental issues or need for intervention (e.g., shunt)."
        
        details = f"The LVW measurement was {lvw_mm}mm which is outside the normal range (<{lvw_max}mm) for gestational age {gest_age_weeks} weeks, indicating {severity}."
        recommendation = "Please perform additional tests to narrow down potential causes including obstructive hydrocephalus, neural tube defects, or agenesis of corpus callosum. " + prognosis
    
    return {
        "status": status,
        "summary": summary,
        "details": details,
        "recommendation": recommendation
    }

@app.route("/analyze-ventricles", methods=["POST"])
def analyze_ventricles():
    if "image" not in request.files or "gestationalAge" not in request.form:
        return jsonify({"error": "Missing image or gestational age"}), 400

    file = request.files["image"]
    gest_age_weeks = int(request.form["gestationalAge"])
    filename = secure_filename(file.filename)
    image_path = os.path.join("temp", filename)
    os.makedirs("temp", exist_ok=True)
    file.save(image_path)

    # Load image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    input_img = preprocess_image(img).reshape(1, 128, 128, 1)
    predicted_mask = model.predict(input_img)[0].reshape(128, 128)

    lvw_mm, _, _ = calculate_lvw_from_mask(
        predicted_mask, img, pixel_spacing=0.3, gest_age_weeks=gest_age_weeks
    )

    os.remove(image_path)

    if lvw_mm is None:
        return jsonify({"error": "Unable to detect ventricles"}), 500

    # Analyze the LVW measurement
    analysis = analyze_lvw(lvw_mm, gest_age_weeks)
    
    # Prepare response
    response = {
        "lvw_mm": round(lvw_mm, 2),
        "gestational_age_weeks": gest_age_weeks,
        "status": analysis["status"],
        "summary": analysis["summary"],
        "details": analysis["details"],
        "recommendation": analysis["recommendation"]
    }

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True, port=5002)