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

    lvw_mm, _, status = calculate_lvw_from_mask(
        predicted_mask, img, pixel_spacing=0.3, gest_age_weeks=gest_age_weeks
    )

    os.remove(image_path)

    if lvw_mm is None:
        return jsonify({"error": "Unable to detect ventricles"}), 500

    return jsonify({
        "lvw_mm": round(lvw_mm, 2),
        "status": status
    })

if __name__ == "__main__":
    app.run(debug=True, port=5002)
