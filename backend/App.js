// app.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const { testConnection } = require('./db');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Request logging

// Static files
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Import routes
const analyzeRoutes = require("./routes/AnalyzeRoutes");

// Use routes
app.use("/api", analyzeRoutes);

// Database connection test
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    timestamp: new Date(),
    dbConnected
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server error',
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection on startup
  testConnection();
});

module.exports = app;