// services/FileSystemService.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileSystemService {
  constructor() {
    this.scanStoragePath = path.join(__dirname, '../storage/scans');
    this.annotationsStoragePath = path.join(__dirname, '../storage/annotations');
    
    // Ensure directories exist
    this.ensureDirectoryExists(this.scanStoragePath);
    this.ensureDirectoryExists(this.annotationsStoragePath);
  }

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async saveScanImage(fileBuffer, patientId) {
    const filename = `${patientId}_${Date.now()}.jpg`;
    const filepath = path.join(this.scanStoragePath, filename);
    
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, fileBuffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            filename,
            filepath,
            relativePath: `/storage/scans/${filename}`
          });
        }
      });
    });
  }

  async saveAnnotatedImage(fileBuffer, originalFilename, reportId) {
    const filename = `${path.parse(originalFilename).name}_annotated.jpg`;
    const filepath = path.join(this.annotationsStoragePath, filename);
    
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, fileBuffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            filename,
            filepath,
            relativePath: `/storage/annotations/${filename}`
          });
        }
      });
    });
  }

  getReadStream(imagePath) {
    return fs.createReadStream(imagePath);
  }

  deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }
}

module.exports = new FileSystemService();