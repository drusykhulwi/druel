const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { analyzeBrainScan } = require("../controllers/AnalyzeController");

router.post("/analyze", upload.single("image"), analyzeBrainScan);

module.exports = router;
