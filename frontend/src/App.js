import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload'
import History from './pages/History';
import Report from './pages/Report';

function App() {
  // For demonstration purposes, we'll assume the user is not logged in
  const isLoggedIn = false;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route 
          path="/dashboard" 
          element={ <Dashboard />} 
        />
        <Route 
          path="/upload" 
          element={ <Upload />} 
        />
        <Route 
          path="/history" 
          element={ <History />} 
        />
        <Route 
          path="/report" 
          element={ <Report />} 
        />
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;