// routes/AnalyzeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Import controllers
const { analyzeBrainScan } = require("../controllers/AnalyzeBrainController");
const { analyzeVentricular } = require("../controllers/AnalyzeVentricularController");
const { analyzeCerebellum } = require("../controllers/AnalyzeCerebellumController");

// Brain analysis route
router.post("/analyze-brain", upload.single("image"), analyzeBrainScan);

// Cerebellum analysis route
router.post("/analyze-cerebellum", upload.single("image"), analyzeCerebellum);

// Ventricular analysis route
router.post("/analyze-ventricular", upload.single("image"), analyzeVentricular);

// Get scan results route
router.get("/scans/:scanId", async (req, res) => {
  try {
    const scanId = req.params.scanId;
    const scanService = require("../services/ScanService");
    
    const scanDetails = await scanService.getScanDetailsWithReports(scanId);
    
    if (!scanDetails) {
      return res.status(404).json({ success: false, error: "Scan not found" });
    }
    
    res.json({
      success: true,
      data: scanDetails
    });
  } catch (error) {
    console.error("Error retrieving scan details:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve scan details" });
  }
});

// Get patient scans route
router.get("/patient-scans/:patientId", async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const scanService = require("../services/ScanService");
    
    const scans = await scanService.getPatientScans(patientId);
    
    res.json({
      success: true,
      data: scans
    });
  } catch (error) {
    console.error("Error retrieving patient scans:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve patient scans" });
  }
});

module.exports = router;