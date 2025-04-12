const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.analyzeVentricular = async (req, res) => {
  try {
    const imagePath = req.file.path;
    const gestAge = req.body.gestationalAge;

    const form = new FormData();
    form.append("image", fs.createReadStream(imagePath));
    form.append("gestationalAge", gestAge);

    const response = await axios.post("http://localhost:5002/analyze-ventricles", form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(imagePath); // clean up temp file

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Ventricular analysis failed:", error.message);
    res.status(500).json({ success: false, error: "Ventricular analysis failed." });
  }
};
