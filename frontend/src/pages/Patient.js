import React, { useState, useEffect } from 'react';

const Patient = () => {
  const [patients, setPatients] = useState([
    { id: 'P-10001', name: 'John Smith', dateAdded: 'Apr 10, 2025', lastScan: 'Apr 12, 2025', status: 'Active' },
    { id: 'P-10002', name: 'Emma Johnson', dateAdded: 'Apr 08, 2025', lastScan: 'Apr 11, 2025', status: 'Active' },
    { id: 'P-10003', name: 'Michael Davis', dateAdded: 'Apr 05, 2025', lastScan: 'Apr 09, 2025', status: 'Inactive' },
    { id: 'P-10004', name: 'Sarah Wilson', dateAdded: 'Apr 02, 2025', lastScan: 'Apr 08, 2025', status: 'Active' },
  ]);

  const [newPatient, setNewPatient] = useState({ name: '', status: 'Active' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(patients);
  
  // Generate a new patient ID (simple increment of last ID)
  const generatePatientId = () => {
    if (patients.length === 0) return 'P-10001';
    
    const lastId = patients[patients.length - 1].id;
    const numericPart = parseInt(lastId.split('-')[1]);
    return `P-${numericPart + 1}`;
  };

  // Format current date as "Apr 14, 2025"
  const getCurrentDate = () => {
    const date = new Date();
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newPatient.name.trim()) {
      alert('Please enter a patient name');
      return;
    }
    
    const patientToAdd = {
      id: generatePatientId(),
      name: newPatient.name.trim(),
      dateAdded: getCurrentDate(),
      lastScan: 'No scans yet',
      status: newPatient.status
    };
    
    setPatients([...patients, patientToAdd]);
    setNewPatient({ name: '', status: 'Active' });
  };

  // Filter patients based on search term
  useEffect(() => {
    const results = patients.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(results);
  }, [searchTerm, patients]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patient Management</h1>
      </div>

      {/* Add Patient Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Patient</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                Patient Name
              </label>
              <input
                id="patientName"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-druel-blue focus:border-druel-blue"
                placeholder="Enter patient name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="patientStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="patientStatus"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-druel-blue focus:border-druel-blue"
                value={newPatient.status}
                onChange={(e) => setNewPatient({...newPatient, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-druel-blue text-white rounded-md hover:bg-druel-light-blue transition-colors"
            >
              Add Patient
            </button>
          </div>
        </form>
      </div>

      {/* Patient List Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Patient List</h2>
            
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="pl-10 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-druel-blue focus:border-druel-blue"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Scan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-druel-blue">
                      {patient.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.dateAdded}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.lastScan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-druel-blue hover:text-druel-light-blue mr-3">
                        View
                      </button>
                      <button className="text-druel-blue hover:text-druel-light-blue">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination - can be extended with functionality */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPatients.length}</span> of{' '}
                <span className="font-medium">{filteredPatients.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button className="bg-druel-blue border-gray-300 text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patient;