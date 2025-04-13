// src/components/Dashboard.js
import React from 'react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h2>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Total Scans</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold">1,234</span>
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
              <span className="text-2xl font-bold">89</span>
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
              <span className="text-2xl font-bold">756</span>
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
              <span className="text-2xl font-bold">98.5%</span>
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
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 14l3-3 4 4 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Ultrasound Analysis Completed</p>
                  <p className="text-sm text-gray-500">Patient ID: 71144 • 2h ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 14l3-3 4 4 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Ultrasound Analysis Completed</p>
                  <p className="text-sm text-gray-500">Patient ID: 47545 • 2h ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 14l3-3 4 4 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Ultrasound Analysis Completed</p>
                  <p className="text-sm text-gray-500">Patient ID: 43212 • 3h ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4">System Status</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">AI Model</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="font-medium">Image Processing</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="font-medium">Report Generation</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;