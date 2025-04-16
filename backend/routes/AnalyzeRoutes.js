// routes/AnalyzeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { 
  analyzeBrainScan, 
  getPatientScans, 
  getScanDetails 
} = require("../controllers/AnalyzeController");

const { 
  analyzeVentricular 
} = require("../controllers/AnalyzeVentricularController");

const { 
  analyzeCerebellum 
} = require("../controllers/AnalyzeCerebellumController");

// Patient search and management
router.get("/patients/search", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, error: "Search term required" });
    }
    
    const PatientModel = require('../models/PatientModel');
    const patients = await PatientModel.searchPatientsByName(name);
    
    res.json({ success: true, data: patients });
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({ success: false, error: "Failed to search patients" });
  }
});

// Patient scans
router.get("/patients/:patientId/scans", getPatientScans);
router.get("/scans/:scanId", getScanDetails);

// AI Analysis endpoints
router.post("/analyze", upload.single("image"), analyzeBrainScan);
router.post("/analyze-ventricular", upload.single("image"), analyzeVentricular);
router.post("/analyze-cerebellum", upload.single("image"), analyzeCerebellum);

module.exports = router;