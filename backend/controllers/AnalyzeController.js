const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

exports.analyzeBrainScan = async (req, res) => {
  try {
    const imagePath = req.file.path; // e.g., using multer
    const gestAge = req.body.gestationalAge;

    const form = new FormData();
    form.append("image", fs.createReadStream(imagePath));
    form.append("gestationalAge", gestAge);

    const flaskResponse = await axios.post("http://localhost:5000/analyze", form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    // Delete the temp image after upload
    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      data: flaskResponse.data,
    });

  } catch (err) {
    console.error("Error calling Flask API:", err.message);
    res.status(500).json({ success: false, error: "Image analysis failed." });
  }
};
