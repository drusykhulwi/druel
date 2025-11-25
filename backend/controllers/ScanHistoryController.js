// controllers/scanHistoryController.js
const scanService = require('../services/ScanService');
const pool = require('../db'); 

exports.getRecentScans = async (req, res) => {
  try {
    // Optional: Get limit from query params or use a default
    const limit = parseInt(req.query.limit) || 10;
    
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
      ORDER BY 
        s.scan_date DESC,
        s.created_at DESC
      LIMIT ?
    `, [limit]);
    
    // Transform image_path to full URL if needed
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const transformedRows = rows.map(row => ({
    ...row,
    imagePath: row.imagePath ? `${baseUrl}${row.imagePath}` : null
    }));

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scan history' });
  }
};

exports.getScanDetails = async (req, res) => {
  try {
    const scanId = req.params.scanId;
    const scanDetails = await scanService.getScanDetailsWithReports(scanId);
    
    if (!scanDetails) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    // Get base URL for building complete image URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Format the data to match the expected structure in the frontend
    const formattedData = {
      id: scanDetails.scan_id,
      patientNumber: scanDetails.patient_id,
      scanDate: new Date(scanDetails.scan_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      abnormalities: scanDetails.reports[0]?.num_abnormalities_detected || 0,
      confidence: scanDetails.reports[0]?.confidence_score || 0,
      imageQuality: scanDetails.reports[0]?.image_quality || 'Unknown',
      processingTime: scanDetails.reports[0]?.processing_time ? `${scanDetails.reports[0].processing_time}s` : 'N/A',
      status: scanDetails.reports[0]?.is_normal ? 'Normal' : 'Abnormal',
      imagePath: scanDetails.images[0]?.image_path || null,
      features: scanDetails.reports[0]?.features.map((feature, index) => ({
        id: feature.feature_id,
        name: `Feature ${index + 1}`,
        title: feature.feature_name,
        description: feature.feature_description,
        confidence: feature.confidence_score
      })) || []
    };
    
    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Error fetching scan details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scan details' });
  }
};