// controllers/AnalyzeCerebellumController.js
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const PatientModel = require('../models/PatientModel');
const ScanModel = require('../models/ScanModel');
const ReportModel = require('../models/ReportModel');

// Constants
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '../storage');

exports.analyzeCerebellum = async (req, res) => {
  const startTime = Date.now(); // For tracking processing time
  
  try {
    // Extract required data
    const imagePath = req.file.path;
    const gestAge = parseInt(req.body.gestationalAge, 10);
    const patientId = req.body.patientId;
    const patientName = req.body.patientName;
    const scanDate = req.body.scanDate || new Date().toISOString().split('T')[0]; // Default to today
    
    // Validate inputs
    if (!gestAge || isNaN(gestAge) || gestAge < 10 || gestAge > 40) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid gestational age. Must be between 10 and 40 weeks." 
      });
    }

    // Create or get patient
    let patient;
    if (patientId) {
      patient = await PatientModel.getPatientById(patientId);
      if (!patient) {
        return res.status(404).json({ success: false, error: "Patient not found" });
      }
    } else if (patientName) {
      patient = await PatientModel.createPatient(patientName);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: "Either patientId or patientName is required" 
      });
    }

    // Create scan record
    const scan = await ScanModel.createScan(patient.patient_id, scanDate, gestAge);
    
    // Create permanent file path
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${patient.patient_id}_${scan.scanId}_cerebellum_${Date.now()}${fileExt}`;
    const storagePath = path.join(STORAGE_DIR, 'scans', patient.patient_id);
    const permanentFilePath = path.join(storagePath, fileName);
    
    // Store image in database and move to permanent location
    const imageRecord = await ScanModel.storeImage(scan.scanId, imagePath, permanentFilePath);

    // Prepare request to Flask API
    const form = new FormData();
    form.append("image", fs.createReadStream(imagePath));
    form.append("gestationalAge", gestAge);

    // Call Flask API for cerebellum analysis
    const flaskResponse = await axios.post("http://localhost:5001/analyze-cerebellum", form, {
      headers: form.getHeaders(),
    });

    // Calculate processing time
    const processingTime = (Date.now() - startTime) / 1000; // Convert to seconds
    
    // Store AI report in database
    const report = await ReportModel.storeReport(
      scan.scanId, 
      flaskResponse.data, 
      processingTime, 
      'Good' // Default image quality
    );

    // Clean up uploaded file
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    res.json({
      success: true,
      data: {
        ...flaskResponse.data,
        patientId: patient.patient_id,
        scanId: scan.scanId,
        reportId: report.reportId
      },
    });
  } catch (error) {
    console.error("Cerebellum analysis failed:", error.message);
    res.status(500).json({ success: false, error: "Cerebellum analysis failed." });
  }
};