import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Report from './pages/Report';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} className="route-name"/>
        <Route path="/Upload" element={<Upload />} className="route-name"/>
        <Route path="/Analysis" element={<Analysis className="route-name"/>} />
        <Route path="/Report" element={<Report className="route-name"/>} />
      </Routes>
    </Router>
  )
}

export default App
