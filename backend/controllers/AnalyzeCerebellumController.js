const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.AnalyzeCerebellum = async (req, res) => {
  try {
    const imagePath = req.file.path;
    const gestAge = req.body.gestationalAge;

    const form = new FormData();
    form.append("image", fs.createReadStream(imagePath));
    form.append("gestationalAge", gestAge);

    const response = await axios.post("http://localhost:5001/analyze-cerebellum", form, {
      headers: form.getHeaders(),
    });

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Cerebellum analysis failed:", error.message);
    res.status(500).json({ success: false, error: "Cerebellum analysis failed." });
  }
};
