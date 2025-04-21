import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the auth context
const AuthContext = createContext();

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth-status', { withCredentials: true });
        
        if (response.data.isAuthenticated) {
          // Fetch user data
          const userResponse = await axios.get('http://localhost:5000/api/user', { withCredentials: true });
          setCurrentUser(userResponse.data);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', 
        { email, password }, 
        { withCredentials: true }
      );
      
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed'
      };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/signup', 
        userData, 
        { withCredentials: true }
      );
      
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Signup failed'
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      setCurrentUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false,
        message: error.response?.data?.error || 'Logout failed'
      };
    }
  };
  // Forgot Password function
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('http://localhost:5000/api/forgot-password', { email });
      return { 
        success: true,
        message: response.data.message,
        // In development, you might want to return the token
        token: response.data.token
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to process password reset request'
      };
    }
  };

  // Verify reset token function
  const verifyResetToken = async (token) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reset-password/${token}`);
      return { 
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Invalid or expired token'
      };
    }
  };

  // Reset Password function
  const resetPassword = async (token, password, confirmPassword) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/reset-password/${token}`, 
        { password, confirmPassword }
      );
      return { 
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to reset password'
      };
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    verifyResetToken,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
