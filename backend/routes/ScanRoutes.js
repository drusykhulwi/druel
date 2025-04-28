// routes/scanRoutes.js
const express = require('express');
const router = express.Router();
const scanHistoryController = require('../controllers/ScanHistoryController');
const pool = require('../db'); 

// Get recent scans for history page
router.get('/history', scanHistoryController.getRecentScans);

// Get details for a specific scan
router.get('/details/:scanId', scanHistoryController.getScanDetails);

// Add this to your ScanRoutes.js file
router.get('/search', async (req, res) => {
    const { term } = req.query;
    
    try {
      const [rows] = await pool.query(`
        SELECT 
          s.scan_id as id,
          s.patient_id as patientNumber,
          DATE_FORMAT(s.scan_date, '%b %d, %Y') as scanDate,
          ar.num_abnormalities_detected as abnormalities,
          ar.confidence_score as confidence,
          ar.image_quality as imageQuality,
          ar.processing_time as processingTime,
          IF(ar.is_normal = 1, 'Normal', 'Abnormal') as status,
          i.image_path as imagePath
        FROM 
          scans s
        LEFT JOIN 
          ai_reports ar ON s.scan_id = ar.scan_id
        LEFT JOIN 
          images i ON s.scan_id = i.scan_id
        WHERE 
          s.patient_id LIKE ? OR
          EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.patient_id = s.patient_id AND p.patient_name LIKE ?
          )
        ORDER BY 
          s.scan_date DESC,
          s.created_at DESC
      `, [`%${term}%`, `%${term}%`]);
      
      // Transform image_path to full URL if needed
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const transformedRows = rows.map(row => ({
        ...row,
        imagePath: row.imagePath ? `${baseUrl}${row.imagePath}` : null
      }));
  
      res.json(transformedRows);
    } catch (error) {
      console.error('Error searching scan history:', error);
      res.status(500).json({ error: 'Failed to search scan history' });
    }
  });
module.exports = router;