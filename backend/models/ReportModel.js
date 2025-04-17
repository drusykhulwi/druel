// models/ReportModel.js
const { pool } = require('../server');
const fs = require('fs').promises;

class ReportModel {
  // Store AI analysis results
  static async storeReport(scanId, aiResponse, processingTime, imageQuality = 'Good') {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Determine if the result is normal based on analysis data
      let isNormal = true;
      let numAbnormalities = 0;
      let primaryFindings = "No significant abnormalities detected";
      let confidenceScore = 95.0; // Default confidence score
      
      // Extract specific data based on the type of analysis
      if (aiResponse.bpd_status === 'abnormal' || aiResponse.hc_status === 'abnormal') {
        isNormal = false;
        numAbnormalities += (aiResponse.bpd_status === 'abnormal' ? 1 : 0) + 
                          (aiResponse.hc_status === 'abnormal' ? 1 : 0);
        primaryFindings = aiResponse.summary;
      } else if (aiResponse.status === 'abnormal') { // For ventricular or cerebellum analysis
        isNormal = false;
        numAbnormalities = 1;
        primaryFindings = aiResponse.summary || aiResponse.assessment;
      } else if (aiResponse.assessment && aiResponse.assessment.includes('abnormal')) {
        isNormal = false;
        numAbnormalities = 1;
        primaryFindings = aiResponse.assessment;
      }
      
      // Insert AI report
      const [reportResult] = await connection.query(
        `INSERT INTO ai_reports 
         (scan_id, primary_findings, confidence_score, image_quality, is_normal, num_abnormalities_detected, processing_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [scanId, primaryFindings, confidenceScore, imageQuality, isNormal, numAbnormalities, processingTime]
      );
      
      const reportId = reportResult.insertId;
      
      // Insert individual detected features
      if (aiResponse.bpd_mm) {
        await connection.query(
          'INSERT INTO detected_features (report_id, feature_name, feature_description, confidence_score) VALUES (?, ?, ?, ?)',
          [reportId, 'BPD', `BPD measurement: ${aiResponse.bpd_mm}mm - ${aiResponse.bpd_status}`, 98.0]
        );
      }
      
      if (aiResponse.hc_mm) {
        await connection.query(
          'INSERT INTO detected_features (report_id, feature_name, feature_description, confidence_score) VALUES (?, ?, ?, ?)',
          [reportId, 'HC', `HC measurement: ${aiResponse.hc_mm}mm - ${aiResponse.hc_status}`, 98.0]
        );
      }
      
      if (aiResponse.tcd_mm) {
        await connection.query(
          'INSERT INTO detected_features (report_id, feature_name, feature_description, confidence_score) VALUES (?, ?, ?, ?)',
          [reportId, 'TCD', `TCD measurement: ${aiResponse.tcd_mm}mm - ${aiResponse.assessment || 'analyzed'}`, 98.0]
        );
      }
      
      if (aiResponse.lvw_mm) {
        await connection.query(
          'INSERT INTO detected_features (report_id, feature_name, feature_description, confidence_score) VALUES (?, ?, ?, ?)',
          [reportId, 'LVW', `LVW measurement: ${aiResponse.lvw_mm}mm - ${aiResponse.status || 'analyzed'}`, 98.0]
        );
      }
      
      await connection.commit();
      
      return {
        reportId,
        scanId,
        isNormal,
        primaryFindings,
        numAbnormalities
      };
    } catch (error) {
      await connection.rollback();
      console.error('Error storing AI report:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Store annotated image
  static async storeAnnotatedImage(reportId, originalImageId, annotationPath) {
    try {
      const [result] = await pool.query(
        'INSERT INTO annotated_images (report_id, original_image_id, annotation_path) VALUES (?, ?, ?)',
        [reportId, originalImageId, annotationPath]
      );
      
      return {
        annotatedImageId: result.insertId,
        reportId,
        originalImageId,
        annotationPath
      };
    } catch (error) {
      console.error('Error storing annotated image:', error);
      throw error;
    }
  }

  // Get AI reports for a specific scan
  static async getReportsByScanId(scanId) {
    try {
      // Get the main report information
      const [reports] = await pool.query(
        'SELECT * FROM ai_reports WHERE scan_id = ?',
        [scanId]
      );
      
      if (!reports.length) return [];
      
      // For each report, get its features and annotated images
      for (const report of reports) {
        const [features] = await pool.query(
          'SELECT * FROM detected_features WHERE report_id = ?',
          [report.report_id]
        );
        
        const [annotatedImages] = await pool.query(
          `SELECT ai.*, i.image_path as original_image_path 
           FROM annotated_images ai
           JOIN images i ON ai.original_image_id = i.image_id
           WHERE ai.report_id = ?`,
          [report.report_id]
        );
        
        report.features = features;
        report.annotatedImages = annotatedImages;
      }
      
      return reports;
    } catch (error) {
      console.error('Error fetching AI reports:', error);
      throw error;
    }
  }
}

module.exports = ReportModel;