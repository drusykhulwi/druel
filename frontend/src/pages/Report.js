import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Report = () => {
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportContentRef = useRef(null);
  
  // Get params and location from router
  const { scanId } = useParams();
  const location = useLocation();
  const analysisData = location.state?.analysisData;
  const planeType = location.state?.planeType;

  // Fetch report data if not provided in location state
  useEffect(() => {
    if (analysisData) {
      console.log("Analysis data from Upload:", analysisData);
      
      // Format data passed from Upload.js - ensure we capture all model-provided data
      const formattedData = {
        patientId: analysisData.patientId || '',
        gestationalAge: analysisData.gestationalAge || '',
        scanDate: analysisData.scanDate || new Date().toISOString(),
        summary: analysisData.summary || analysisData.primary_findings || '',
        details: analysisData.details || '',
        recommendation: analysisData.recommendation || '',
        confidence_score: analysisData.confidence_score || 95,
        image_quality: analysisData.image_quality || 'Good',
        status: analysisData.status || (analysisData.is_normal ? 'normal' : 'abnormal'),
        notes: analysisData.notes || '',
        imagePath: analysisData.imagePath || (analysisData.images && analysisData.images[0]?.image_path) || null,
        annotationPath: analysisData.annotationPath || 
                        (analysisData.reports && 
                         analysisData.reports[0]?.annotated_images && 
                         analysisData.reports[0].annotated_images[0]?.annotation_path) || null,
        features: analysisData.features || 
                 (analysisData.reports && 
                  analysisData.reports[0]?.features) || [],
        measurements: {
          bpd_mm: analysisData.bpd_mm,
          hc_mm: analysisData.hc_mm,
          tcd_mm: analysisData.tcd_mm,
          lvw_mm: analysisData.lvw_mm,
          bpd_status: analysisData.bpd_status,
          hc_status: analysisData.hc_status,
          bpd_detail: analysisData.bpd_detail,
          hc_detail: analysisData.hc_detail,
          assessment: analysisData.assessment
        }
      };
      
      console.log("Formatted data:", formattedData);
      setReportData(formattedData);
      if (formattedData.notes) {
        setAdditionalNotes(formattedData.notes);
      }
      setIsLoading(false);
    } else if (scanId) {
      // Fetch data if we have a scanId but no analysis data
      fetchReportData(scanId);
    } else {
      setError('No scan data available');
      setIsLoading(false);
    }
  }, [analysisData, scanId]);

  // Function to fetch report data from API
  const fetchReportData = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/scans/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch scan data');
      }
      
      const data = await response.json();
      console.log("API data:", data);
      
      // Format the data from backend to match our component's expectations
      // Capture all the model analysis data
      const formattedData = {
        patientId: data.patient_id || '',
        gestationalAge: data.gestational_age || '',
        scanDate: data.scan_date || new Date().toISOString(),
        summary: data.summary || (data.reports && data.reports[0]?.primary_findings) || '',
        details: data.details || (data.reports && data.reports[0]?.details) || '',
        recommendation: data.recommendation || (data.reports && data.reports[0]?.recommendation) || '',
        confidence_score: data.confidence_score || 
                         (data.reports && data.reports[0]?.confidence_score) || 95,
        image_quality: data.image_quality || 
                      (data.reports && data.reports[0]?.image_quality) || 'Good',
        status: data.status || data.is_normal || (data.reports && data.reports[0]?.is_normal) ? 'normal' : 'abnormal',
        notes: data.notes || '',
        imagePath: (data.images && data.images[0]?.image_path) || null,
        annotationPath: (data.reports && 
                        data.reports[0]?.annotated_images && 
                        data.reports[0].annotated_images[0]?.annotation_path) || null,
        features: (data.reports && data.reports[0]?.features) || [],
        measurements: {
          bpd_mm: data.bpd_mm || (data.reports && data.reports[0]?.bpd_mm),
          hc_mm: data.hc_mm || (data.reports && data.reports[0]?.hc_mm),
          tcd_mm: data.tcd_mm || (data.reports && data.reports[0]?.tcd_mm),
          lvw_mm: data.lvw_mm || (data.reports && data.reports[0]?.lvw_mm),
          bpd_status: data.bpd_status || (data.reports && data.reports[0]?.bpd_status),
          hc_status: data.hc_status || (data.reports && data.reports[0]?.hc_status),
          bpd_detail: data.bpd_detail || (data.reports && data.reports[0]?.bpd_detail),
          hc_detail: data.hc_detail || (data.reports && data.reports[0]?.hc_detail),
          assessment: data.assessment || (data.reports && data.reports[0]?.assessment)
        }
      };
      
      console.log("Formatted API data:", formattedData);
      setReportData(formattedData);
      if (formattedData.notes) {
        setAdditionalNotes(formattedData.notes);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to load report data');
      setIsLoading(false);
    }
  };

  // Function to handle printing
  const handlePrint = () => {
    const content = reportContentRef.current;
    
    // Create a clone of the report content to avoid modifying the original
    const printContent = content.cloneNode(true);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Druel AI Report</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 100%; overflow-x: hidden; }
            .print-container { padding: 20px; }
            h2 { color: #2563eb; margin-bottom: 16px; font-size: 18px; font-weight: 600; }
            .grid-row { display: flex; flex-wrap: wrap; margin-bottom: 24px; }
            .grid-item { flex: 0 0 50%; margin-bottom: 16px; }
            .label { color: #4b5563; margin-bottom: 4px; }
            .value { font-weight: 500; }
            .measurement { padding: 8px; border-radius: 6px; margin-bottom: 8px; }
            .measurement.normal { background-color: #f0fdf4; border-left: 4px solid #22c55e; }
            .measurement.abnormal { background-color: #fff7ed; border-left: 4px solid #f59e0b; }
            .finding-section { border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 16px; }
            .finding-section:last-child { border-bottom: none; }
            .disclaimer { background-color: #f9fafb; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 24px; }
            .disclaimer h3 { color: #2563eb; font-size: 16px; margin-bottom: 8px; }
            .disclaimer p { color: #4b5563; font-size: 14px; }
            img { max-width: 100%; height: auto; }
            @media print {
              body { padding: 0; margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Function to handle PDF download
  const handleDownloadPDF = async () => {
    const content = reportContentRef.current;
    
    try {
      // Use html2canvas to capture the component as an image
      const canvas = await html2canvas(content, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
      });
      
      // Create PDF with appropriate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Download PDF
      pdf.save('Druel_AI_Report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Function to save additional notes
  const saveAdditionalNotes = async () => {
    if (!scanId || !additionalNotes) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/scans/${scanId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: additionalNotes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save notes');
      }
      
      // Update local state
      setReportData(prev => ({
        ...prev,
        notes: additionalNotes
      }));
      
      alert('Notes saved successfully');
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Format plane type for display
  const formatPlaneType = (type) => {
    if (!type) return 'Unknown';
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get the correct image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    
    // If path is already a full URL, return it
    if (path.startsWith('http')) {
      return path;
    }
    
    // If path already has /storage/ prefix, use as is
    if (path.startsWith('/storage/')) {
      return `http://localhost:5000${path}`;
    }
    
    // Otherwise, prepend the storage path
    return `http://localhost:5000/storage/${path}`;
  };

  // Helper function to get primary findings based on status and model data
  const getPrimaryFindings = () => {
    // First check if there's an explicit summary from the model
    if (reportData?.summary) {
      return reportData.summary;
    }
    
    // Check for assessment (used in TCD analysis)
    if (reportData?.measurements?.assessment) {
      return reportData.measurements.assessment;
    }
    
    // If no explicit summary, use the status and measurement data
    const { measurements, status } = reportData;
    
    if (planeType === 'trans-thalamic') {
      if (measurements?.bpd_status === 'abnormal' && measurements?.hc_status === 'abnormal') {
        return "Both BPD and HC measurements are abnormal.";
      } else if (measurements?.bpd_status === 'abnormal') {
        return "BPD measurement is abnormal while HC is normal.";
      } else if (measurements?.hc_status === 'abnormal') {
        return "HC measurement is abnormal while BPD is normal.";
      } else {
        return "BPD and HC measurements are normal.";
      }
    } else if (planeType === 'trans-ventricular') {
      return status === 'normal' 
        ? "LVW measurement is normal."
        : "LVW measurement is abnormal.";
    } else if (planeType === 'trans-cerebellum') {
      return measurements?.tcd_mm 
        ? `TCD ${status === 'normal' ? 'measurement is normal' : 'measurement is abnormal'}.`
        : `${status === 'normal' ? 'Normal' : 'Abnormal'} findings.`;
    }
    
    return status === 'normal' ? "All measurements are normal." : "Abnormal measurements detected.";
  };

  // Helper function to render detailed findings from model analysis
  const renderDetailedFindings = () => {
    const { measurements, details, recommendation } = reportData;
    
    // First check if we have explicit details from the analysis
    if (details) {
      return (
        <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <p className="mb-4">{details}</p>
          
          {recommendation && (
            <div className="mt-4">
              <h3 className="font-medium text-druel-blue mb-2">Recommendation</h3>
              <p>{recommendation}</p>
            </div>
          )}
        </div>
      );
    }
    
    // If no explicit details, use the measurement-specific details
    if (planeType === 'trans-thalamic') {
      return (
        <div className="mb-6">
          {measurements?.bpd_detail && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="font-medium text-druel-blue mb-2">BPD Analysis</h3>
              <p>{measurements.bpd_detail}</p>
            </div>
          )}
          
          {measurements?.hc_detail && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="font-medium text-druel-blue mb-2">HC Analysis</h3>
              <p>{measurements.hc_detail}</p>
            </div>
          )}
        </div>
      );
    }
    
    // Use features if available
    if (reportData?.features && reportData.features.length > 0) {
      return (
        <div className="mb-6">
          {reportData.features.map((feature, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="font-medium text-druel-blue mb-2">Finding {index + 1}</h3>
              <p>{feature.feature_description || feature.description || feature}</p>
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback message if no details available
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
        <p>
          {reportData?.status === 'normal' 
            ? 'All measurements and parameters are within normal ranges for the gestational age.' 
            : 'One or more measurements are outside normal ranges for the gestational age.'}
        </p>
      </div>
    );
  };

  // Helper function to render measurements based on plane type
  const renderMeasurements = () => {
    const { measurements } = reportData;
    if (!measurements) return null;

    // Determine which measurements to show based on plane type
    switch (planeType) {
      case 'trans-thalamic':
        return (
          <>
            {measurements.bpd_mm && (
              <div className={`mb-4 p-3 rounded-md border-l-4 ${measurements.bpd_status === 'abnormal' ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'}`}>
                <h3 className="font-medium text-gray-800">Biparietal Diameter (BPD)</h3>
                <p className="font-medium">{measurements.bpd_mm} mm</p>
                <p className={`text-sm ${measurements.bpd_status === 'abnormal' ? 'text-amber-700' : 'text-green-700'}`}>
                  Status: {measurements.bpd_status === 'abnormal' ? 'Abnormal' : 'Normal'}
                </p>
              </div>
            )}
            {measurements.hc_mm && (
              <div className={`mb-4 p-3 rounded-md border-l-4 ${measurements.hc_status === 'abnormal' ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'}`}>
                <h3 className="font-medium text-gray-800">Head Circumference (HC)</h3>
                <p className="font-medium">{measurements.hc_mm} mm</p>
                <p className={`text-sm ${measurements.hc_status === 'abnormal' ? 'text-amber-700' : 'text-green-700'}`}>
                  Status: {measurements.hc_status === 'abnormal' ? 'Abnormal' : 'Normal'}
                </p>
              </div>
            )}
          </>
        );
      case 'trans-ventricular':
        return measurements.lvw_mm && (
          <div className={`mb-4 p-3 rounded-md border-l-4 ${reportData.status === 'abnormal' ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'}`}>
            <h3 className="font-medium text-gray-800">Lateral Ventricular Width (LVW)</h3>
            <p className="font-medium">{measurements.lvw_mm} mm</p>
            <p className={`text-sm ${reportData.status === 'abnormal' ? 'text-amber-700' : 'text-green-700'}`}>
              Status: {reportData.status === 'abnormal' ? 'Abnormal' : 'Normal'}
            </p>
          </div>
        );
      case 'trans-cerebellum':
        return measurements.tcd_mm && (
          <div className={`mb-4 p-3 rounded-md border-l-4 ${reportData.status === 'abnormal' ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'}`}>
            <h3 className="font-medium text-gray-800">Transcerebellar Diameter (TCD)</h3>
            <p className="font-medium">{measurements.tcd_mm} mm</p>
            <p className={`text-sm ${reportData.status === 'abnormal' ? 'text-amber-700' : 'text-green-700'}`}>
              Status: {reportData.status === 'abnormal' ? 'Abnormal' : 'Normal'}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-druel-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading report data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <p className="mt-2">Please try again or contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 max-w-full overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-druel-blue mb-2 sm:mb-0">Analysis Report</h1>
          <div className="flex flex-wrap gap-3">
            <button 
              className="flex items-center text-druel-blue border border-druel-blue rounded px-4 py-2"
              onClick={handlePrint}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button 
              className="flex items-center bg-druel-blue text-white rounded px-4 py-2"
              onClick={handleDownloadPDF}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-full overflow-hidden" ref={reportContentRef}>
          <h2 className="text-lg font-semibold text-druel-blue mb-4">Patient Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 mb-1">Patient ID</p>
              <p className="font-medium">{reportData?.patientId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Scan Date</p>
              <p className="font-medium">{formatDate(reportData?.scanDate)}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Report Generated</p>
              <p className="font-medium">{new Date().toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Gestational Age</p>
              <p className="font-medium">{reportData?.gestationalAge || 'N/A'} {reportData?.gestationalAge ? 'weeks' : ''}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Plane Type</p>
              <p className="font-medium">{formatPlaneType(planeType)}</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-druel-blue mb-4">Analysis Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 mb-1">Primary Findings</p>
              <p className="font-medium">{getPrimaryFindings()}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Confidence Score</p>
              <p className="font-medium">{reportData?.confidence_score || '95'}%</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Image Quality</p>
              <p className="font-medium">{reportData?.image_quality || 'Good'}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Status</p>
              <p className={`font-medium ${reportData?.status === 'normal' ? 'text-green-600' : 'text-amber-600'}`}>
                {reportData?.status === 'normal' ? 'Normal' : 'Abnormal'}
              </p>
            </div>
          </div>

          {/* Measurements Section */}
          <h2 className="text-lg font-semibold text-druel-blue mb-4">Measurements</h2>
          {renderMeasurements()}

          {/* Detailed Findings Section */}
          <h2 className="text-lg font-semibold text-druel-blue mb-4">Detailed Findings</h2>
          {renderDetailedFindings()}

          {/* Display scan image if available */}
          {reportData?.imagePath && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-druel-blue mb-4">Scan Image</h2>
              <div className="border border-gray-200 rounded-md p-2">
                <img 
                  src={getImageUrl(reportData.imagePath)} 
                  alt="Ultrasound scan" 
                  className="mx-auto max-h-64 object-contain max-w-full" 
                />
              </div>
            </div>
          )}

          {/* Display annotated image if available */}
          {reportData?.annotationPath && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-druel-blue mb-4">Annotated Scan</h2>
              <div className="border border-gray-200 rounded-md p-2">
                <img 
                  src={getImageUrl(reportData.annotationPath)} 
                  alt="Annotated ultrasound scan" 
                  className="mx-auto max-h-64 object-contain max-w-full" 
                />
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold text-druel-blue mb-4">Additional Notes</h2>
          <div className="w-full border border-gray-300 rounded p-3 min-h-32 overflow-auto">
            {reportData?.notes || additionalNotes || "No additional notes provided."}
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-md font-semibold text-druel-blue mb-2">AI Analysis Disclaimer</h3>
            <p className="text-sm text-gray-600">
              This report was generated using Druel AI Automated Ultrasound Interpretation system. While our AI system provides highly accurate 
              analysis, all findings should be reviewed and verified by a qualified healthcare professional. This report is not a substitute for 
              professional medical advice or diagnosis.
            </p>
          </div>
        </div>
        
        {/* Editor area - outside the printable/downloadable area */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-druel-blue mb-4">Edit Additional Notes</h2>
          <textarea
            className="w-full border border-gray-300 rounded p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-druel-light-blue"
            placeholder="Add any additional notes or observations..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <button 
              className="bg-druel-blue text-white px-4 py-2 rounded-md hover:bg-druel-light-blue transition-colors"
              onClick={saveAdditionalNotes}
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;