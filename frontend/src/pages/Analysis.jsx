import Navbar from "../components/Navbar"
import './Analysis.css';


function Analysis() {
  return (
    <div className="analysis">
      <Navbar/>
      <div className="image-analysis">
        <div className="analysis-header">
          <h3>Image Analysis</h3>
          <button>Generate Report</button>
        </div>
        <div className="analysis-container">
          <div className="analysis-image">
            <img src="https://images.pexels.com/photos/5327916/pexels-photo-5327916.jpeg" alt="analysis"/>
          </div>
          <div className="analytics">
            <div className="analysis-summary">
              <h4>Analysis Summary</h4>
              <div className="texts">
                <p>Confidence score</p>
                <span>98%</span>
              </div>
              <div className="texts">
                <p>Abnormalities Detected</p>
                <span>2</span>
              </div>
              <div className="texts">
                <p>Image Clarity</p>
                <span>High</span>
              </div>
              <div className="texts">
                <p>Processing Time</p>
                <span>1.2s</span>
              </div>
            </div>
            <div className="detected-features">
              <div className="feature">
                <div className="texts">
                  <h4>Feature 1</h4>
                  <span>95% confidence</span>
                </div>
                <p>Potential abnormality detected in upper right quadrant.</p>
              </div>
              <div className="feature">
                  <div className="texts">
                    <h4>Feature 2</h4>
                    <span>98% confidence</span>
                  </div>
                  <p>Normal tissue structure identified.</p>
              </div>
              <div className="feature">
                <div className="texts">
                  <h4>Feature 3</h4>
                  <span>99% confidence</span>
                </div>
                <p>Clear Organ Boundaries visible.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analysis
