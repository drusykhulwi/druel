import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js/dist/html2pdf";
import Navbar from "../components/Navbar";
import { FaDownload, FaPrint } from "react-icons/fa";
import "./Report.css";

function Report() {
  const reportRef = useRef(null); // Reference to the report content

  // Print Function
  const handlePrint = useReactToPrint({
    content: () => reportRef.current || null, // ✅ Ensure ref is returned
    documentTitle: "Report",
    onAfterPrint: () => console.log("Print successful"),
  });

  // Download PDF Function
  const downloadPDF = () => {
    const element = reportRef.current;
    html2pdf().from(element).save("report.pdf");
  };

  return (
    <div>
      <Navbar />
      <div ref={reportRef}  className="report">
        <div className="report-header">
          <h2>Report Generation</h2>
          <div className="reportbtns">
            <button className="print-btn" onClick={handlePrint}>
              <FaPrint /> Print
            </button>
            <button className="download-btn" onClick={downloadPDF}>
              <FaDownload /> Download PDF
            </button>
          </div>
        </div>

        {/* Content to be printed/downloaded */}
        <div className="report-content">
          <div className="patient-information">
            <h3>Patient Information</h3>
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
            <hr />
          </div>

          <div className="analysis-results">
            <h3>Analysis Results</h3>
            <div className="info">
              <h5>Primary Findings</h5>
              <p>Normal tissue structure with no significant abnormalities</p>
            </div>
            <div className="info">
              <h5>Confidence Score</h5>
              <p>98%</p>
            </div>
            <div className="info">
              <h5>Image Quality</h5>
              <p>High</p>
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
            <hr />
          </div>

          <div className="disclaimer">
            <h3>AI Analysis Disclaimer</h3>
            <p>
              This report was generated using Druel AI Automated Ultrasound Interpretation system. While our AI system provides highly accurate analysis,
              all findings should be reviewed and verified by a qualified healthcare professional. This report is not a substitute for professional medical advice or diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
