// controllers/AnalyzeCerebellumController.js
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const scanService = require("../services/ScanService");
const fileSystemService = require("../services/FileSystemService");

exports.analyzeCerebellum = async (req, res) => {
  try {
    // Check if we have all required data
    if (!req.file || !req.body.patientId || !req.body.gestationalAge) {
      return res.status(400).json({ 
        success: false, 
        error: "Image file, patient ID, and gestational age are required" 
      });
    }

    const imagePath = req.file.path;
    const gestAge = parseInt(req.body.gestationalAge);
    const patientId = req.body.patientId;

    // Create scan record in database
    const scanId = await scanService.createScan(patientId, gestAge);

    // Save the image to permanent storage
    const savedImage = await fileSystemService.saveScanImage(
      fs.readFileSync(imagePath),
      patientId
    );

    // Save image path to database
    const imageId = await scanService.saveImage(scanId, savedImage.relativePath);

    // Create form for Flask API
    const form = new FormData();
    form.append("image", fs.createReadStream(imagePath));
    form.append("gestationalAge", gestAge);

    // Send to Flask API
    const startTime = Date.now();
    const response = await axios.post("http://127.0.0.1:4001/analyze-cerebellum", form, {
      headers: form.getHeaders(),
    });
    const processingTime = (Date.now() - startTime) / 1000; // Convert to seconds

    // Clean up temp file
    fs.unlinkSync(imagePath);

    // Process the response data
    const status = response.data.assessment.toLowerCase().includes("abnormal") ? "abnormal" : "normal";

    const reportData = {
      summary: response.data.assessment,
      details: response.data.details,
      status: status,
      processing_time: processingTime,
      confidence_score: 95, // Default confidence score
      tcd_mm: response.data.tcd_mm
    };

    // Save AI report to database
    const reportId = await scanService.saveAIReport(scanId, reportData);

    // In a real system, we would also save annotated images here
    // For now, we'll mock this with placeholder path
    const annotationPath = savedImage.relativePath.replace('.jpg', '_annotated.jpg');
    await scanService.saveAnnotatedImage(reportId, imageId, annotationPath);

    // Return complete response
    res.json({
      success: true,
      data: {
        ...reportData,
        scanId,
        imageId,
        reportId,
        imagePath: savedImage.relativePath
      }
    });
  } catch (error) {
    console.error("Cerebellum analysis failed:", error.message);
    res.status(500).json({ success: false, error: "Cerebellum analysis failed." });
  }
};