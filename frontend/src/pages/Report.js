// ReportGeneration.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar'; 

const Report = () => {
  const [additionalNotes, setAdditionalNotes] = useState('');

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-druel-blue">Report Generation</h1>
          <div className="flex space-x-3">
            <button className="flex items-center text-druel-blue border border-druel-blue rounded px-4 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button className="flex items-center bg-druel-blue text-white rounded px-4 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-druel-blue mb-4">Patient Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 mb-1">Patient ID</p>
              <p className="font-medium">12345</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Scan Date</p>
              <p className="font-medium">2024-03-15</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Report Generated</p>
              <p className="font-medium">2024-03-15 14:30</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-druel-blue mb-4">Analysis Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 mb-1">Primary Findings</p>
              <p className="font-medium">Normal tissue structure with no significant abnormalities</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Confidence Score</p>
              <p className="font-medium">98%</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Image Quality</p>
              <p className="font-medium">High</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 mb-1">Feature 1</p>
              <p className="font-medium">Normal tissue density observed in upper right quadrant</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Feature 2</p>
              <p className="font-medium">Clear organ boundaries visible throughout the scan</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Feature 3</p>
              <p className="font-medium">No suspicious masses or abnormalities detected</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-druel-blue mb-4">Additional Notes</h2>
          <textarea
            className="w-full border border-gray-300 rounded p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-druel-light-blue"
            placeholder="Add any additional notes or observations..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
          />

          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-md font-semibold text-druel-blue mb-2">AI Analysis Disclaimer</h3>
            <p className="text-sm text-gray-600">
              This report was generated using Druel AI Automated Ultrasound Interpretation system. While our AI system provides highly accurate 
              analysis, all findings should be reviewed and verified by a qualified healthcare professional. This report is not a substitute for 
              professional medical advice or diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;