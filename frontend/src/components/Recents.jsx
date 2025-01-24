import { FaClock } from 'react-icons/fa';
import './Recents.css';


function Recents() {
  return (
    <div className='dashboard-bottom'>
        <div className='recents'>
            <h4>Recent Activities</h4>
            <div className="recents-container">
                <div className="recents-cards">
                    <div className='icon'>
                        <FaClock/>
                    </div>
                    <div className='card'>
                        <h5>Ultrasound Analysis Completed</h5>
                        <p>Patient ID #12145 2hr ago</p>
                    </div>
                </div>
                <div className="recents-cards">
                    <div className='icon'>
                        <FaClock/>
                    </div>
                    <div className='card'>
                        <h5>Ultrasound Analysis Completed</h5>
                        <p>Patient ID #12145 2hr ago</p>
                    </div>
                </div>
                <div className="recents-cards">
                    <div className='icon'>
                        <FaClock/>
                    </div>
                    <div className='card'>
                        <h5>Ultrasound Analysis Completed</h5>
                        <p>Patient ID #12145 2hr ago</p>
                    </div>
                </div>  
            </div>
        </div>
        <div className='system'>
            <h4>System Status</h4>
            <div className='system-container'>
                <div className='card'>
                    <p>AI Model</p>
                    <div className='tag'>
                        Operational
                    </div>
                </div>
                <div className='card'>
                    <p>Image Processing</p>
                    <div className='tag'>
                        Operational
                    </div>
                </div>
                <div className='card'>
                    <p>Report Generation</p>
                    <div className='tag'>
                        Operational
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Recents
