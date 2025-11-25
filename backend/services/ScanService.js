// services/ScanService.js
const pool = require('../db');
const fileSystemService = require('./FileSystemService');

class ScanService {
  async createScan(patientId, gestationalAge, scanDate = null, notes = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Insert the scan record with notes
      const [scanResult] = await connection.execute(
        'INSERT INTO scans (patient_id, scan_date, gestational_age, notes) VALUES (?, IFNULL(?, CURDATE()), ?, ?)',
        [patientId, scanDate, gestationalAge, notes]
      );
      
      const scanId = scanResult.insertId;
      
      await connection.commit();
      return scanId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async saveImage(scanId, imagePath) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO images (scan_id, image_path) VALUES (?, ?)',
        [scanId, imagePath]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async saveAIReport(scanId, reportData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Insert AI report
      const [reportResult] = await connection.execute(
        `INSERT INTO ai_reports 
         (scan_id, primary_findings, confidence_score, image_quality, is_normal, num_abnormalities_detected, processing_time) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          scanId, 
          reportData.summary || reportData.details, 
          reportData.confidence_score || 95, 
          reportData.image_quality || 'Good', 
          reportData.status === 'normal', 
          reportData.status === 'normal' ? 0 : 1,
          reportData.processing_time || 3.5
        ]
      );
      
      const reportId = reportResult.insertId;
      
      // Insert detailed features if available
      if (reportData.features && reportData.features.length > 0) {
        for (const feature of reportData.features) {
          await connection.execute(
            'INSERT INTO detected_features (report_id, feature_name, feature_description, confidence_score) VALUES (?, ?, ?, ?)',
            [reportId, feature.feature_name || 'Finding', feature.feature_description || feature, feature.confidence_score || 90]
          );
        }
      } else if (reportData.details) {
        await connection.execute(
          'INSERT INTO detected_features (report_id, feature_name, feature_description, confidence_score) VALUES (?, ?, ?, ?)',
          [reportId, reportData.status === 'normal' ? 'Normal scan' : 'Abnormal finding', reportData.details, 90]
        );
      }
      
      await connection.commit();
      return reportId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async saveAnnotatedImage(reportId, originalImageId, annotationPath) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO annotated_images (report_id, original_image_id, annotation_path) VALUES (?, ?, ?)',
        [reportId, originalImageId, annotationPath]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateScanNotes(scanId, notes) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE scans SET notes = ? WHERE scan_id = ?',
        [notes, scanId]
      );
      
      return true;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getPatientScans(patientId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          s.scan_id,
          s.scan_date,
          s.gestational_age,
          s.notes,
          ar.report_id,
          ar.primary_findings,
          ar.is_normal,
          i.image_path,
          ai.annotation_path
        FROM 
          scans s
        LEFT JOIN 
          images i ON s.scan_id = i.scan_id
        LEFT JOIN 
          ai_reports ar ON s.scan_id = ar.scan_id
        LEFT JOIN 
          annotated_images ai ON ar.report_id = ai.report_id AND i.image_id = ai.original_image_id
        WHERE 
          s.patient_id = ?
        ORDER BY 
          s.scan_date DESC
      `, [patientId]);
      
      return rows;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getScanDetailsWithReports(scanId) {
    const connection = await pool.getConnection();
    try {
      // Get scan basic info
      const [scanRows] = await connection.execute(`
        SELECT 
          s.scan_id,
          s.patient_id,
          s.scan_date,
          s.gestational_age,
          s.notes,
          p.patient_name
        FROM 
          scans s
        LEFT JOIN
          patients p ON s.patient_id = p.patient_id
        WHERE 
          s.scan_id = ?
      `, [scanId]);
      
      if (scanRows.length === 0) {
        return null;
      }
      
      const scan = scanRows[0];
      
      // Get reports for this scan
      const [reportRows] = await connection.execute(`
        SELECT 
          ar.report_id,
          ar.primary_findings,
          ar.confidence_score,
          ar.image_quality,
          ar.is_normal,
          ar.report_generated_date
        FROM 
          ai_reports ar
        WHERE 
          ar.scan_id = ?
      `, [scanId]);
      
      scan.reports = reportRows;
      
      // Get images for this scan
      const [imageRows] = await connection.execute(`
        SELECT 
          i.image_id,
          i.image_path
        FROM 
          images i
        WHERE 
          i.scan_id = ?
      `, [scanId]);
      
      scan.images = imageRows;
      
      // Get detected features for each report
      for (const report of scan.reports) {
        const [featureRows] = await connection.execute(`
          SELECT 
            feature_id,
            feature_name,
            feature_description,
            confidence_score
          FROM 
            detected_features
          WHERE 
            report_id = ?
        `, [report.report_id]);
        
        report.features = featureRows;
        
        // Get annotated images for this report
        const [annotationRows] = await connection.execute(`
          SELECT 
            ai.annotated_image_id,
            ai.original_image_id,
            ai.annotation_path
          FROM 
            annotated_images ai
          WHERE 
            ai.report_id = ?
        `, [report.report_id]);
        
        report.annotated_images = annotationRows;
      }
      
      return scan;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new ScanService();