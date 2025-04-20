import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';


function Dashboard () {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState({
    totalScans: 0,
    activePatients: 0,
    reportsGenerated: 0,
    analysisAccuracy: 0
  });
    
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    aiModel: 'Operational',
    imageProcessing: 'Operational',
    reportGeneration: 'Operational'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
     // Set up Axios with credentials for session cookie
     axios.defaults.withCredentials = true;
    // Fetch dashboard metrics data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

         // Get metrics data
         const metricsResponse = await axios.get('http://localhost:5000/api/metrics');
         // Ensure analysisAccuracy is a number
         const metricsData = {
           ...metricsResponse.data,
           analysisAccuracy: parseFloat(metricsResponse.data.analysisAccuracy) || 0
         };
         setMetrics(metricsData);
        
        // Get recent activities
        const activitiesResponse = await axios.get('http://localhost:5000/api/recent-activities');
        setRecentActivities(activitiesResponse.data);
        
        // Get system status
        const statusResponse = await axios.get('http://localhost:5000/api/system-status');
        setSystemStatus(statusResponse.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please refresh the page.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <h4>Welcome, <strong>{currentUser.username}!</strong></h4>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Total Scans</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold">{metrics.totalScans.toLocaleString()}</span>
              <svg className="h-10 w-10 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14l3-3 4 4 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 14l3-3 4 4 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Active Patients</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold">{metrics.activePatients.toLocaleString()}</span>
              <svg className="h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 8a5 5 0 00-10 0v4a5 5 0 0010 0V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 11h.01M8 11h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 18a6 6 0 01-6-6V8a6 6 0 0112 0v4a6 6 0 01-6 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Reports Generated</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold">{metrics.reportsGenerated.toLocaleString()}</span>
              <svg className="h-10 w-10 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Analysis Accuracy</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold">{(metrics.analysisAccuracy).toFixed(1)}%</span>
              <svg className="h-10 w-10 text-yellow-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7v-2a2 2 0 012-2h4a2 2 0 012 2v2M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M8 7h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 11h8M8 15h8M8 19h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activities</h3>
            
            <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 14l3-3 4 4 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">{activity.activity}</p>
                  <p className="text-sm text-gray-500">Patient ID: {activity.patientId} • {activity.timeAgo}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No recent activities</p>
          )}
          </div>
        </div>

          {/* System Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4">System Status</h3>
            
            <div className="space-y-4">
            {Object.entries(systemStatus).map(([key, status]) => (
              <div key={key} className="flex justify-between items-center">
                <p className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Dashboard;