// controllers/AnalyzeController.js
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const PatientModel = require('../models/PatientModel');
const ScanModel = require('../models/ScanModel');
const ReportModel = require('../models/ReportModel');

// Constants
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '../storage');

exports.analyzeBrainScan = async (req, res) => {
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
    const fileName = `${patient.patient_id}_${scan.scanId}_${Date.now()}${fileExt}`;
    const storagePath = path.join(STORAGE_DIR, 'scans', patient.patient_id);
    const permanentFilePath = path.join(storagePath, fileName);
    
    // Store image in database and move to permanent location
    await ScanModel.storeImage(scan.scanId, imagePath, permanentFilePath);

    // Prepare request to Flask API
    const form = new FormData();
    form.append("image", fs.createReadStream(imagePath));
    form.append("gestationalAge", gestAge);

    // Call Flask API for brain analysis
    const flaskResponse = await axios.post("http://localhost:5000/analyze", form, {
      headers: {
        ...form.getHeaders(),
      },
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

    // Delete the temp image after upload
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

  } catch (err) {
    console.error("Error in brain scan analysis:", err.message);
    res.status(500).json({ success: false, error: "Image analysis failed." });
  }
};

exports.getPatientScans = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Check if patient exists
    const patient = await PatientModel.getPatientById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }
    
    // Get scans for this patient
    const scans = await ScanModel.getScansByPatientId(patientId);
    
    res.json({
      success: true,
      data: {
        patient,
        scans
      }
    });
  } catch (error) {
    console.error("Error fetching patient scans:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve patient scans" });
  }
};

exports.getScanDetails = async (req, res) => {
  try {
    const { scanId } = req.params;
    
    // Get scan with images
    const scan = await ScanModel.getScanWithImages(scanId);
    if (!scan) {
      return res.status(404).json({ success: false, error: "Scan not found" });
    }
    
    // Get reports for this scan
    const reports = await ReportModel.getReportsByScanId(scanId);
    
    res.json({
      success: true,
      data: {
        scan,
        reports
      }
    });
  } catch (error) {
    console.error("Error fetching scan details:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve scan details" });
  }
};