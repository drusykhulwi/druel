// routes/scanRoutes.js
const express = require('express');
const router = express.Router();
const scanHistoryController = require('../controllers/ScanHistoryController');

// Get recent scans for history page
router.get('/history', scanHistoryController.getRecentScans);

// Get details for a specific scan
router.get('/details/:scanId', scanHistoryController.getScanDetails);

module.exports = router;