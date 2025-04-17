// models/ScanModel.js
const { pool } = require('../server');
const fs = require('fs').promises;
const path = require('path');

class ScanModel {
  // Create a new scan record
  static async createScan(patientId, scanDate, gestationalAge) {
    try {
      const [result] = await pool.query(
        'INSERT INTO scans (patient_id, scan_date, gestational_age) VALUES (?, ?, ?)',
        [patientId, scanDate, gestationalAge]
      );
      
      return {
        scanId: result.insertId,
        patientId,
        scanDate,
        gestationalAge
      };
    } catch (error) {
      console.error('Error creating scan:', error);
      throw error;
    }
  }

  // Store image path and link to scan
  static async storeImage(scanId, originalFilePath, permanentFilePath) {
    try {
      // Move the file to permanent storage location
      await fs.mkdir(path.dirname(permanentFilePath), { recursive: true });
      await fs.copyFile(originalFilePath, permanentFilePath);
      
      // Add entry to database
      const [result] = await pool.query(
        'INSERT INTO images (scan_id, image_path) VALUES (?, ?)',
        [scanId, permanentFilePath]
      );
      
      return {
        imageId: result.insertId,
        scanId,
        imagePath: permanentFilePath
      };
    } catch (error) {
      console.error('Error storing image:', error);
      throw error;
    }
  }

  // Get scans for a specific patient
  static async getScansByPatientId(patientId) {
    try {
      const [rows] = await pool.query(
        `SELECT s.*, 
          (SELECT COUNT(*) FROM images i WHERE i.scan_id = s.scan_id) as image_count,
          (SELECT COUNT(*) FROM ai_reports ar WHERE ar.scan_id = s.scan_id) as report_count
        FROM scans s 
        WHERE s.patient_id = ?
        ORDER BY s.scan_date DESC`,
        [patientId]
      );
      
      return rows;
    } catch (error) {
      console.error('Error fetching scans:', error);
      throw error;
    }
  }

  // Get a specific scan with images
  static async getScanWithImages(scanId) {
    try {
      const [scanRows] = await pool.query(
        'SELECT * FROM scans WHERE scan_id = ?',
        [scanId]
      );
      
      if (!scanRows.length) return null;
      
      const scan = scanRows[0];
      
      const [imageRows] = await pool.query(
        'SELECT * FROM images WHERE scan_id = ?',
        [scanId]
      );
      
      scan.images = imageRows;
      
      return scan;
    } catch (error) {
      console.error('Error fetching scan with images:', error);
      throw error;
    }
  }
}

module.exports = ScanModel;