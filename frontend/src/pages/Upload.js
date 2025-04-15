import { useState } from 'react';
import { UploadCloud, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // React Router import
import Navbar from '../components/Navbar';

export default function Upload() {
  const navigate = useNavigate(); // Initialize navigate
  const [image, setImage] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [scanDate, setScanDate] = useState('');
  const [notes, setNotes] = useState('');
  const [planeType, setPlaneType] = useState('trans-thalamic'); // Add state for plane type

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
    };
    
    reader.readAsDataURL(file);
  };

  // Function to handle form submission and redirection
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Determine the route based on the selected plane type
    let targetRoute;
    switch (planeType) {
      case 'trans-thalamic':
        targetRoute = '/transthalamic';
        break;
      case 'trans-ventricular':
        targetRoute = '/transventricular';
        break;
      case 'trans-cerebellum':
        targetRoute = '/transcerebellum';
        break;
      default:
        targetRoute = '/transthalamic';  // Default route
    }
    
    // Create search params for data passing
    const searchParams = new URLSearchParams();
    if (patientId) searchParams.append('patientId', patientId);
    if (scanDate) searchParams.append('scanDate', scanDate);
    if (notes) searchParams.append('notes', notes);
    
    // Redirect to the appropriate route with query parameters
    navigate({
      pathname: targetRoute,
      search: searchParams.toString()
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-sm">
          <h2 className="text-lg font-medium mb-4">Upload Ultrasound Image</h2>
          
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
              <label htmlFor="patient-id" className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
              <div className="relative">
                <input
                  id="patient-id"
                  type="text"
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md"
                  placeholder="Enter patient ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
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
              <label htmlFor="gest-age" className="block text-sm font-medium text-gray-700 mb-1">Gestational Age</label>
              <div className="relative">
                <input
                  id="gest-age"
                  type="number"
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md"
                  placeholder="Enter Gestational Age in weeks"
                  // value={gestage}
                  // onChange={(e) => setPatientId(e.target.value)}
                />
                <span className="absolute left-2 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="plane-type" className="block text-sm font-medium text-gray-700 mb-1">Plane Type:</label>
              <div className="relative">
                <select
                  id="plane-type"
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md"
                  value={planeType}
                  onChange={(e) => setPlaneType(e.target.value)}
                >
                  <option value="trans-thalamic">Trans Thalamic</option>
                  <option value="trans-ventricular">Trans Ventricular</option>
                  <option value="trans-cerebellum">Trans Cerebellum</option>
                </select>
                <span className="absolute left-2 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
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
              className="bg-druel-blue text-white px-4 py-2 rounded-md hover:bg-druel-light-blue transition-colors"
            >
              Submit and Analyze
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}