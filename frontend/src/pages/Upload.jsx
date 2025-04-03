import Navbar from "../components/Navbar"
import { FaUpload } from 'react-icons/fa';
import './Upload.css';


function Upload() {
  return (
    <div className="uploads">
      <Navbar/>
      <div className="uploads-container">
        <h1>Upload Ultrasound Image</h1>
        <div className="upload">
          <div className="upload-container">
            <div className="cont">
              <div className="icons">
                <FaUpload/>
              </div>
              <p>Drag and drop your ultrasound images here, or</p>
              <input
                type="file"
                accept=".jpg, .jpeg, .png, .dicom"
                className="upload-input"
                id="file-upload"
                placeholder="Browse files"
              />
              <p className="supported">Supported formats DICOM, JPG, PNG</p>
            </div>
          </div>
          <form className="patient-details">
            <div className="inputs">
              <div className="input">
                <label>Patient ID</label>
                <input type="text" placeholder="Enter Patient ID" className="input-placeholder"/>
              </div>
              <div className="input">
                <label>Scan Date</label>
                <input type="date" placeholder="Enter Patient ID" className="input-date" />
              </div>
            </div>
            <div className="upload-btn">
              <button>Upload and Analyze</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Upload
