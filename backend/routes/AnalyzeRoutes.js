const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { analyzeBrainScan } = require("../controllers/AnalyzeController");
const { analyzeVentricular } = require("../controllers/AnalyzeVentricullarController");
const { analyzeCerebellum } = require("../controllers/analyzeCerebellum.controller");

router.post("/analyze-cerebellum", upload.single("image"), analyzeCerebellum);

router.post("/analyze", upload.single("image"), analyzeBrainScan);
router.post("/analyze-ventricular", upload.single("image"), analyzeVentricular);

module.exports = router;
