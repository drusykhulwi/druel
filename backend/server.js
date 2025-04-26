const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const scanService = require('./services/ScanService');
const router = express.Router();
const nodemailer = require('nodemailer');


const app = express();
const PORT = process.env.PORT || 5000;
require('dotenv').config();
const scanRoutes = require('./routes/ScanRoutes');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // The React app's URL
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(router);

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_APP_PASSWORD 
  }
});
// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.status(200).json({ message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Failed to connect to database' });
  }
});

// Authentication middleware
const authenticateUser = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Please log in' });
};

// API Routes
// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validation
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const connection = await pool.getConnection();
    
    // Check if username or email already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    connection.release();
    
    // Auto-login after signup
    req.session.userId = result.insertId;
    
    return res.status(201).json({ 
      success: true,
      message: 'User created successfully', 
      user: {
        id: result.insertId,
        username,
        email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Set user session
    req.session.userId = user.id;
    
    return res.status(200).json({ 
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Check authentication status
app.get('/api/auth-status', (req, res) => {
  if (req.session.userId) {
    return res.json({ 
      isAuthenticated: true,
      userId: req.session.userId
    });
  } else {
    return res.json({ isAuthenticated: false });
  }
});

// Get user data for dashboard
// Password Reset Request 
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    // Check if user exists
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      connection.release();
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link.'
      });
    }
    
    const user = users[0];
    
    // Generate a reset token and expiration (24 hours from now)
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Save token to database
    await connection.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetExpires, user.id]
    );
    
    connection.release();
    
    console.log(`Reset link would be sent to ${email} with token: ${resetToken}`);
    
    try {
      // Attempt to send the email
      const emailSent = await sendPasswordResetEmail(email, resetToken);
      
      if (!emailSent) {
        console.error(`Failed to send password reset email to ${email}`);
        // Return an error to the frontend while maintaining security
        return res.status(500).json({
          success: false,
          message: 'Unable to send reset email at this time. Please try again later.'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link.'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Return an error to the frontend while maintaining security
      return res.status(500).json({
        success: false,
        message: 'Unable to send reset email at this time. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Password Reset Request
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    // Check if user exists
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      connection.release();
      // For security, don't reveal if email exists or not
      return res.status(200).json({ 
        success: true,
        message: 'If your email is registered, you will receive a password reset link.' 
      });
    }
    
    const user = users[0];
    
    // Generate a reset token and expiration (24 hours from now)
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Save token to database
    await connection.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetExpires, user.id]
    );
    
    connection.release();
    
    // In a real application, I would send an email with the reset link
    // For this example, I'll just return the token in the response
    // In production, use a service like Nodemailer to send actual emails
    console.log(`Reset link would be sent to ${email} with token: ${resetToken}`);
    const emailSent = await sendPasswordResetEmail(email, resetToken);
  
    if (!emailSent) {
      console.error(`Failed to send password reset email to ${email}`);
      // Consider what to do if email fails - you might want to delete the token
      // or notify an admin, but don't tell the user as it reveals account existence
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'If your email is registered, you will receive a password reset link.',
      // Remove the token in production, only for development testing
      token: resetToken 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Email sending function
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"Druel App" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return false;
  }
};

// Verify Reset Token
app.get('/api/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  
  try {
    const connection = await pool.getConnection();
    
    // Check if token exists and is valid
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    
    connection.release();
    
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Password reset token is invalid or has expired' 
      });
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Reset token verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password
app.post('/api/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  
  // Validation
  if (!password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    // Check if token exists and is valid
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    
    if (users.length === 0) {
      connection.release();
      return res.status(400).json({ 
        success: false,
        message: 'Password reset token is invalid or has expired' 
      });
    }
    
    const user = users[0];
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password and clear reset token
    await connection.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    connection.release();
    
    return res.status(200).json({ 
      success: true,
      message: 'Password has been reset successfully' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});




// Get all patients with their latest scan
app.get('/api/patients', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.patient_id AS id, 
        p.patient_name AS name, 
        DATE_FORMAT(p.created_at, '%b %d, %Y') AS dateAdded,
        p.status,
        (SELECT DATE_FORMAT(MAX(scan_date), '%b %d, %Y') 
         FROM scans 
         WHERE patient_id = p.patient_id) AS lastScan
      FROM patients p
      ORDER BY p.created_at DESC
    `);
    
    // Format the data for the frontend
    const patients = rows.map(patient => ({
      ...patient,
      lastScan: patient.lastScan || 'No scans yet'
    }));
    
    res.status(200).json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Add a new patient
app.post('/api/patients', async (req, res) => {
  const { name, status } = req.body;
  
  if (!name || !status) {
    return res.status(400).json({ error: 'Patient name and status are required' });
  }
  
  try {
    // Generate a patient ID in the format P-XXXXX
    const patientId = `P-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Insert the new patient
    await pool.query(
      'INSERT INTO patients (patient_id, patient_name, status) VALUES (?, ?, ?)',
      [patientId, name, status]
    );
    
    // Get the newly created patient with formatted date
    const [newPatient] = await pool.query(`
      SELECT 
        patient_id AS id, 
        patient_name AS name, 
        DATE_FORMAT(created_at, '%b %d, %Y') AS dateAdded,
        status
      FROM patients
      WHERE patient_id = ?
    `, [patientId]);
    
    res.status(201).json({
      ...newPatient[0],
      lastScan: 'No scans yet'
    });
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ error: 'Failed to add patient' });
  }
});

// Search patients
app.get('/api/patients/search', async (req, res) => {
  const { term } = req.query;
  
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.patient_id AS id, 
        p.patient_name AS name, 
        DATE_FORMAT(p.created_at, '%b %d, %Y') AS dateAdded,
        p.status,
        (SELECT DATE_FORMAT(MAX(scan_date), '%b %d, %Y') 
         FROM scans 
         WHERE patient_id = p.patient_id) AS lastScan
      FROM patients p
      WHERE p.patient_id LIKE ? OR p.patient_name LIKE ?
      ORDER BY p.created_at DESC
    `, [`%${term}%`, `%${term}%`]);
     
    // Format the data
    const patients = rows.map(patient => ({
      ...patient,
      lastScan: patient.lastScan || 'No scans yet'
    }));
    
    res.status(200).json(patients);
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({ error: 'Failed to search patients' });
  }
});

// Update patient status
app.put('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await pool.query(
      'UPDATE patients SET status = ? WHERE patient_id = ?',
      [status, id]
    );
    
    res.status(200).json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Add a scan for a patient
app.post('/api/scans', async (req, res) => {
  const { patientId, scanDate, gestationalAge } = req.body;
  
  try {
    await pool.query(
      'INSERT INTO scans (patient_id, scan_date, gestational_age) VALUES (?, ?, ?)',
      [patientId, scanDate, gestationalAge]
    );
    
    res.status(201).json({ message: 'Scan added successfully' });
  } catch (error) {
    console.error('Error adding scan:', error);
    res.status(500).json({ error: 'Failed to add scan' });
  }
});

// DASHBOARD METRICS ENDPOINTS

// Get dashboard metrics
app.get('/api/metrics', async (req, res) => {
  try {
    // Get total scans count
    const [scanRows] = await pool.query('SELECT COUNT(*) as count FROM scans');
    const totalScans = scanRows[0].count;
    
    // Get active patients (patients with scans in the last 30 days)
    const [patientRows] = await pool.query(`
      SELECT COUNT(DISTINCT patient_id) as count 
      FROM scans 
      WHERE scan_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    const activePatients = patientRows[0].count;
    
    // Get total reports generated
    const [reportRows] = await pool.query('SELECT COUNT(*) as count FROM ai_reports');
    const reportsGenerated = reportRows[0].count;

    // Get average confidence score (analysis accuracy)
    const [accuracyRows] = await pool.query('SELECT AVG(confidence_score) as avg_score FROM ai_reports');
    const analysisAccuracy = accuracyRows[0].avg_score || 0;
    
    res.json({
      totalScans,
      activePatients,
      reportsGenerated,
      analysisAccuracy
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get recent activities for dashboard
app.get('/api/recent-activities', async (req, res) => {
  try {
    // Get recent scan activities with report generation
    const [activities] = await pool.query(`
      SELECT 
        p.patient_id,
        ar.report_generated_date,
        ar.is_normal,
        ar.primary_findings
      FROM patients p
      JOIN scans s ON p.patient_id = s.patient_id
      JOIN ai_reports ar ON s.scan_id = ar.scan_id
      ORDER BY ar.report_generated_date DESC
      LIMIT 5
    `);

    // Format the activities for frontend display
    const formattedActivities = activities.map(activity => {
      // Calculate time ago
      const reportDate = new Date(activity.report_generated_date);
      const now = new Date();
      const diffMilliseconds = now - reportDate;

      // Convert to hours with fractions
      const diffHours = diffMilliseconds / (1000 * 60 * 60);

      const timeAgo = diffHours > 24
          ? `${Math.floor(diffHours / 24)}d ago`
          : diffHours < 1
              ? `${Math.max(1, Math.floor(diffHours * 60))}m ago` // Ensure at least "1m ago"
              : `${Math.floor(diffHours)}h ago`;


      return {
        patientId: activity.patient_id,
        activity: 'Ultrasound Analysis Completed',
        status: activity.is_normal ? 'Normal' : 'Abnormal',
        findings: activity.primary_findings,
        timeAgo
      };
    });
    
    res.json(formattedActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

// Get system status for dashboard
app.get('/api/system-status', async (req, res) => {
  try {
    // Check AI model availability (example: query processing times)
    const [processingTimes] = await pool.query(`
      SELECT AVG(processing_time) as avg_time 
      FROM ai_reports 
      WHERE report_generated_date >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);
    
    const avgProcessingTime = processingTimes[0].avg_time || 0;

     // Check report generation (example: recent successful reports)
    const [recentReports] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM ai_reports 
      WHERE report_generated_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    
    const recentReportCount = recentReports[0].count || 0;
    
    // Determine status based on metrics
    const aiModelStatus = avgProcessingTime < 5 ? 'Operational' : 'Degraded';
    const imageProcessingStatus = avgProcessingTime < 10 ? 'Operational' : 'Degraded';
    const reportGenerationStatus = recentReportCount > 0 ? 'Operational' : 'Degraded';
    
    res.json({
      aiModel: aiModelStatus,
      imageProcessing: imageProcessingStatus,
      reportGeneration: reportGenerationStatus
    });
  } catch (error) {
    console.error('Error checking system status:', error);
    res.status(500).json({ 
      aiModel: 'Unknown',
      imageProcessing: 'Unknown',
      reportGeneration: 'Unknown'
    });
  }
});


// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create storage directories if they don't exist
const storageDir = path.join(__dirname, 'storage');
const scanStorageDir = path.join(storageDir, 'scans');
const annotationsStorageDir = path.join(storageDir, 'annotations');

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}
if (!fs.existsSync(scanStorageDir)) {
  fs.mkdirSync(scanStorageDir, { recursive: true });
}
if (!fs.existsSync(annotationsStorageDir)) {
  fs.mkdirSync(annotationsStorageDir, { recursive: true });
}

// Import routes
const analyzeRoutes = require('./routes/AnalyzeRoutes');

// Use routes
app.use('/api', analyzeRoutes);

// Serve static files from storage directory
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Error handling middleware for file uploads
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    return res.status(400).json({ 
      success: false, 
      error: `File upload error: ${err.message}` 
    });
  } else if (err) {
    // An unknown error occurred
    console.error('Server error:', err);
    return res.status(500).json({ 
      success: false, 
      error: `Server error: ${err.message}` 
    });
  }
  next();
});

router.put('/api/scans/:id/notes', async (req, res) => {
  try {
    const scanId = req.params.id;
    const { notes } = req.body;
    
    if (!notes) {
      return res.status(400).json({ error: 'Notes are required' });
    }
    
    await scanService.updateScanNotes(scanId, notes);
    
    res.status(200).json({ 
      success: true, 
      message: 'Notes updated successfully' 
    });
  } catch (error) {
    console.error('Error updating scan notes:', error);
    res.status(500).json({ 
      error: 'An error occurred while updating the notes' 
    });
  }
});

//Scan Routes for the history
app.use('/api/scan-history', scanRoutes);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

