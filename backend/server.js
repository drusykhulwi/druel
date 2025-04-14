const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
require('dotenv').config();

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
app.get('/api/user', authenticateUser, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?', 
      [req.session.userId]
    );
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = rows[0];
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
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