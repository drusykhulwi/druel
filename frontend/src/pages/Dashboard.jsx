import Navbar from "../components/Navbar"
import { FaChartBar, FaFileAlt, FaUserFriends, FaFileMedical } from 'react-icons/fa';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <Navbar/>
      <h1>Dashboard</h1>
      <div className="dashboard-container">
        <div className="dashboard-cards">
          <div className="card">
            <h5>Total Scans</h5>
            <h3>1,234</h3>
          </div>
          <div className="icon">
            <FaFileMedical/>
          </div>
        </div>
        <div className="dashboard-cards">
          <div className="card">
            <h5>Active Patients</h5>
            <h3>89</h3>
          </div>
          <div className="icon">
            <FaUserFriends/>  
          </div>
        </div>
        <div className="dashboard-cards">
          <div className="card">
            <h5>Reports Generated</h5>
            <h3>756</h3>
          </div>
          <div className="icon">
            <FaFileAlt />
          </div>
        </div>
        <div className="dashboard-cards">
          <div className="card">
            <h5>Analysis accuracy</h5>
            <h3>98.5%</h3>
          </div>
          <div className="icon">
            <FaChartBar /> 
          </div> 
        </div>
      </div>
    </div>
  )
}

export default Dashboard
