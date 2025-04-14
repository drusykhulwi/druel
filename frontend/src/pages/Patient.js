import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';

// Configure axios base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

const Patient = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', status: 'Active' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients');
      setPatients(response.data);
      setFilteredPatients(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again later.');
      setLoading(false);
    }
  };

  // Load patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const searchPatients = async () => {
        try {
          const response = await api.get(`/patients/search?term=${searchTerm}`);
          setFilteredPatients(response.data);
        } catch (err) {
          console.error('Error searching patients:', err);
        }
      };

      // Debounce search
      const timeoutId = setTimeout(() => {
        searchPatients();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, patients]);

  // Handle form submission for adding a new patient
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPatient.name.trim()) {
      alert('Please enter a patient name');
      return;
    }
    
    try {
      const response = await api.post('/patients', {
        name: newPatient.name.trim(),
        status: newPatient.status
      });
      
      setPatients([response.data, ...patients]);
      setNewPatient({ name: '', status: 'Active' });
    } catch (err) {
      console.error('Error adding patient:', err);
      alert('Failed to add patient. Please try again.');
    }
  };

  // Handle status change
  const handleStatusChange = async (patientId, newStatus) => {
    try {
      await api.put(`/patients/${patientId}`, { status: newStatus });
      
      // Update local state
      const updatedPatients = patients.map(patient => 
        patient.id === patientId ? { ...patient, status: newStatus } : patient
      );
      
      setPatients(updatedPatients);
    } catch (err) {
      console.error('Error updating patient status:', err);
      alert('Failed to update patient status. Please try again.');
    }
  };

  // Calculate pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
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
          
          {/* Loading state */}
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-druel-blue mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading patients...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-8 text-center">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={fetchPatients} 
                className="mt-4 px-4 py-2 bg-druel-blue text-white rounded-md hover:bg-druel-light-blue transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Table */}
          {!loading && !error && (
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
                  {currentPatients.length > 0 ? (
                    currentPatients.map((patient) => (
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
                          <button 
                            className="text-druel-blue hover:text-druel-light-blue"
                            onClick={() => handleStatusChange(
                              patient.id, 
                              patient.status === 'Active' ? 'Inactive' : 'Active'
                            )}
                          >
                            {patient.status === 'Active' ? 'Deactivate' : 'Activate'}
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
          )}
          
          {/* Pagination */}
          {!loading && !error && filteredPatients.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstPatient + 1}</span> to <span className="font-medium">
                      {Math.min(indexOfLastPatient, filteredPatients.length)}</span> of{' '}
                    <span className="font-medium">{filteredPatients.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button 
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages).keys()].map(number => (
                      <button 
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`${
                          currentPage === number + 1 
                            ? 'bg-druel-blue border-gray-300 text-white' 
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                      >
                        {number + 1}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Patient;