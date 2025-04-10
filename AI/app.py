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
model.load_weights("unet_brain_seg.h5")

@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files or "gestationalAge" not in request.form:
        return jsonify({"error": "Missing image or gestational age"}), 400

    file = request.files["image"]
    gest_age_weeks = int(request.form["gestationalAge"])
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

    bpd, hc, _, bpd_status, hc_status = calculate_bpd_and_hc_from_mask(
        predicted_mask, img, pixel_spacing=0.3, gest_age_weeks=gest_age_weeks)

    os.remove(image_path)  # clean up temp

    if bpd is None:
        return jsonify({"error": "Could not analyze image"}), 500

    return jsonify({
        "bpd_mm": round(bpd, 2),
        "hc_mm": round(hc, 2),
        "bpd_status": bpd_status,
        "hc_status": hc_status
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
