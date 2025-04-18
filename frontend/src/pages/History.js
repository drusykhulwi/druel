import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const History = () => {
  const [historyItems, setHistoryItems] = useState([
    {
      id: 1,
      patientNumber: "P-10045",
      scanDate: "Apr 10, 2025",
      abnormalities: 2,
      confidence: 98,
      imageQuality: "High",
      processingTime: "1.2s",
      status: "Abnormal"
    },
    {
      id: 2,
      patientNumber: "P-10046",
      scanDate: "Apr 9, 2025",
      abnormalities: 0,
      confidence: 99,
      imageQuality: "High",
      processingTime: "1.1s",
      status: "Normal"
    },
    {
      id: 3,
      patientNumber: "P-10042",
      scanDate: "Apr 8, 2025",
      abnormalities: 3,
      confidence: 95,
      imageQuality: "Medium",
      processingTime: "1.4s",
      status: "Abnormal"
    },
    {
      id: 4,
      patientNumber: "P-10039",
      scanDate: "Apr 7, 2025",
      abnormalities: 0,
      confidence: 97,
      imageQuality: "High",
      processingTime: "1.2s",
      status: "Normal"
    }
  ]);

  const [selectedScan, setSelectedScan] = useState(historyItems[0]);
  
  const handleSelectScan = (scan) => {
    setSelectedScan(scan);
  };

  return (
    <div className="min-h-screen bg-gray-100">
    <Navbar/>
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Scan History</h1>
                <button className="bg-druel-blue text-white px-4 py-2 rounded">
                Generate Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold">Patient {selectedScan.patientNumber}</h2>
                        <p className="text-sm text-gray-600">Scan from {selectedScan.scanDate}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedScan.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                        {selectedScan.status}
                    </div>
                    </div>
                </div>
                <div className="p-4">
                    <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center h-64">
                    <img 
                        src="/api/placeholder/500/300" 
                        alt="Scan preview" 
                        className="max-h-full object-contain"
                    />
                    </div>

                    <div className="flex justify-center mt-4 space-x-4">
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 8a1 1 0 011-1h1V6a1 1 0 012 0v1h1a1 1 0 110 2H9v1a1 1 0 11-2 0V9H6a1 1 0 01-1-1z" />
                        <path fillRule="evenodd" d="M2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    </div>
                </div>
                </div>

                <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Analysis Summary</h2>
                    <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Confidence Score</span>
                        <span className="font-medium">{selectedScan.confidence}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Abnormalities Detected</span>
                        <span className="font-medium">{selectedScan.abnormalities}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Image Quality</span>
                        <span className="font-medium">{selectedScan.imageQuality}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Processing Time</span>
                        <span className="font-medium">{selectedScan.processingTime}</span>
                    </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Detected Features</h2>
                    {selectedScan.abnormalities > 0 ? (
                    <div className="space-y-6">
                        <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Feature 1</span>
                            <span className="text-sm text-gray-600">95% confidence</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Potential abnormality detected in upper right quadrant
                        </p>
                        </div>
                        {selectedScan.abnormalities > 1 && (
                        <div>
                            <div className="flex justify-between mb-1">
                            <span className="font-medium">Feature 2</span>
                            <span className="text-sm text-gray-600">98% confidence</span>
                            </div>
                            <p className="text-sm text-gray-600">
                            Abnormal tissue structure identified
                            </p>
                        </div>
                        )}
                        {selectedScan.abnormalities > 2 && (
                        <div>
                            <div className="flex justify-between mb-1">
                            <span className="font-medium">Feature 3</span>
                            <span className="text-sm text-gray-600">99% confidence</span>
                            </div>
                            <p className="text-sm text-gray-600">
                            Irregular organ boundaries visible
                            </p>
                        </div>
                        )}
                    </div>
                    ) : (
                    <div>
                        <div className="flex justify-between mb-1">
                        <span className="font-medium">Feature 1</span>
                        <span className="text-sm text-gray-600">99% confidence</span>
                        </div>
                        <p className="text-sm text-gray-600">
                        Normal tissue structure identified
                        </p>
                    </div>
                    )}
                </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Scans</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {historyItems.map(item => (
                    <div 
                    key={item.id}
                    onClick={() => handleSelectScan(item)}
                    className={`bg-white rounded-lg shadow p-4 cursor-pointer transform transition-transform hover:scale-105 ${
                        selectedScan.id === item.id ? 'ring-2 ring-druel-blue' : ''
                    }`}
                    >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                        <h3 className="font-semibold">{item.patientNumber}</h3>
                        <p className="text-sm text-gray-600">{item.scanDate}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                        {item.status}
                        </div>
                    </div>
                    <div className="h-32 bg-gray-100 rounded mb-3 flex items-center justify-center">
                        <img 
                        src="/api/placeholder/200/150"
                        alt="Scan thumbnail"
                        className="max-h-full object-contain"
                        />
                    </div>
                    <div className="text-sm">
                        <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span>{item.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                        <span className="text-gray-600">Abnormalities:</span>
                        <span>{item.abnormalities}</span>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default History;