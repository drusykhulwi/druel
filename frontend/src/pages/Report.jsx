import Navbar from "../components/Navbar"
import { FaDownload, FaPrint } from 'react-icons/fa';

function Report() {
  return (
    <div>
      <Navbar/>
      <div className="report">
        <div className="report-header">
          <h2>Report Generation</h2>
          <div className="reportbtns">
            <button><FaPrint/>Print</button>
            <button><FaDownload/>Download PDF</button>
          </div>
        </div>
        <div className="report-content">
          <div className="patient-information">
            <h4>Patient Information</h4>
            <div className="info">
              <h5>Patient ID</h5>
              <p>12345</p>
            </div>
            <div className="info">
              <h5>Scan Date</h5>
              <p>2024-03-15</p>
            </div>
            <div className="info">
              <h5>Report Generated</h5>
              <p>2024-03-15 04:30</p>
            </div>
          </div>
          <div className="analysis-results">
            <h4>Analysis Results</h4>
            <div className="info">
              <h5>Patient ID</h5>
              <p>12345</p>
            </div>
            <div className="info">
              <h5>Scan Date</h5>
              <p>2024-03-15</p>
            </div>
            <div className="info">
              <h5>Report Generated</h5>
              <p>2024-03-15 04:30</p>
            </div>
            <div className="info">
              <h5>Feature 1</h5>
              <p>Normal tissue density observed in upper high quadrant</p>
            </div>
            <div className="info">
              <h5>Feature 2</h5>
              <p>Clear organ boundaries visible throughout the scan</p>
            </div>
            <div className="info">
              <h5>Feature 3</h5>
              <p>No suspicious masses or abnormalities detected</p>
            </div>
          </div>
          <div className="additional-notes">
            <h4>Additional Notes</h4>
            <form>
              <textarea placeholder="Add any additional notes or observations."/>
            </form>
          </div>
          <div className="disclaimer">
            <h5>AI Analysis Disclaimer</h5>
            <p>
              This report was generated using Druel AI Automated Ultrasound Interpretation system. While our AI system provides highly accurate analysis, 
              all findings should be reviewed and verified by a qualified healthcare professional. This report is not substitute for professional medical advice or diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Report
