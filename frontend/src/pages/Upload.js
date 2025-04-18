import { useState } from 'react';
import { UploadCloud, Plus, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Upload() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [actualFile, setActualFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [gestationalAge, setGestationalAge] = useState('');
  const [scanDate, setScanDate] = useState('');
  const [notes, setNotes] = useState('');
  const [planeType, setPlaneType] = useState('trans-thalamic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleImageFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleImageFile(file);
    }
  };

  const handleImageFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      setImage(e.target.result);
      setActualFile(file);
    };
    
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!actualFile) {
      setError('Please upload an image file');
      return;
    }

    if (!patientId) {
      setError('Patient ID is required');
      return;
    }

    if (!gestationalAge) {
      setError('Gestational age is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Determine API endpoint based on selected plane type
      let endpoint;
      switch (planeType) {
        case 'trans-thalamic':
          endpoint = 'http://localhost:5000/api/analyze-brain';
          break;
          case 'trans-ventricular':
            endpoint = 'http://localhost:5000/api/analyze-ventricular';
            break;
          case 'trans-cerebellum':
            endpoint = 'http://localhost:5000/api/analyze-cerebellum';
            break;
          default:
            endpoint = 'http://localhost:5000/api/analyze-brain';
      }

      // Create form data
      const formData = new FormData();
      formData.append('image', actualFile);
      formData.append('patientId', patientId);
      formData.append('gestationalAge', gestationalAge);
      if (notes) formData.append('notes', notes);
      if (scanDate) formData.append('scanDate', scanDate);

      // Send to backend API
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      // On success, navigate to report page with scan ID
      navigate(`/report/${result.data.scanId}`, { 
        state: { 
          analysisData: result.data,
          planeType
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">Upload Ultrasound Image</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div 
            className={`border-2 border-dashed rounded-md p-8 mb-4 flex flex-col items-center justify-center cursor-pointer 
              ${dragging ? 'border-druel-blue bg-blue-50' : 'border-gray-300'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            {image ? (
              <img src={image} alt="Uploaded ultrasound" className="max-h-64 mb-4" />
            ) : (
              <>
                <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500 text-center mb-2">Drag and drop your ultrasound image here, or</p>
                <button 
                  type="button"
                  className="bg-druel-blue text-white px-4 py-2 rounded-md hover:bg-druel-light-blue transition-colors"
                >
                  Browse Files
                </button>
              </>
            )}
            <input 
              id="file-input" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <p className="text-xs text-gray-400 mt-2">Supported formats: DICOM, JPG, PNG</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                Patient ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="patientId"
                  type="text"
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md"
                  placeholder="Enter patient ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
                <span className="absolute left-2 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="scan-date" className="block text-sm font-medium text-gray-700 mb-1">Scan Date</label>
              <div className="relative">
                <input
                  id="scan-date"
                  type="date"
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md"
                  value={scanDate}
                  onChange={(e) => setScanDate(e.target.value)}
                />
                <span className="absolute left-2 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="gestationalAge" className="block text-sm font-medium text-gray-700 mb-1">
                Gestational Age <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="gestationalAge"
                  type="number"
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md"
                  placeholder="Enter weeks"
                  value={gestationalAge}
                  onChange={(e) => setGestationalAge(e.target.value)}
                  required
                  min="1"
                  max="42"
                />
                <span className="absolute left-2 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="plane-type" className="block text-sm font-medium text-gray-700 mb-1">Plane Type:</label>
              <div className="relative">
                <select
                  id="plane-type"
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md appearance-none"
                  value={planeType}
                  onChange={(e) => setPlaneType(e.target.value)}
                >
                  <option value='trans-thalamic'>Trans Thalamic</option>
                  <option value='trans-ventricular'>Trans Ventricular</option>
                  <option value='trans-cerebellum'>Trans Cerebellum</option>
                </select>
                <span className="absolute left-2 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes:</label>
            <div className="relative border border-gray-300 rounded-md p-2">
              <input
                id="notes"
                type="text"
                className="w-full outline-none"
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="absolute left-2 top-2 flex items-center">
                {notes === '' && (
                  <Plus className="h-4 w-4 text-gray-400 mr-1" />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className={`${loading ? 'bg-druel-light-blue' : 'bg-druel-blue hover:bg-druel-light-blue'} text-white px-6 py-2 rounded-md transition-colors flex items-center`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit and Analyze'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}