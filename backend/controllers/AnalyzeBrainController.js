// controllers/AnalyzeBrainController.js
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const scanService = require("../services/ScanService");
const fileSystemService = require("../services/FileSystemService");

exports.analyzeBrainScan = async (req, res) => {
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
    const flaskResponse = await axios.post("http://127.0.0.1:4000/api/analyze-brain", form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    const processingTime = (Date.now() - startTime) / 1000; // Convert to seconds

    // Clean up temp file
    fs.unlinkSync(imagePath);

    // Add processing time to the response data
    const reportData = {
      ...flaskResponse.data,
      processing_time: processingTime
    };

    // Save AI report results to database
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

  } catch (err) {
    console.error("Error in brain scan analysis:", err.message);
    // Log more details if available
  if (err.response) {
    console.error("Response data:", err.response.data);
    console.error("Response status:", err.response.status);
  }
    res.status(500).json({ success: false, error: "Image analysis failed." });
  }
};