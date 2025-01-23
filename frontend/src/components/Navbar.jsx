import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUpload, FaSignOutAlt, FaChartBar, FaFileAlt, FaTachometerAlt, FaBars } from 'react-icons/fa';

import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={`navbar ${isMenuOpen ? 'active' : ''}`}>
      <FaBars className="hamburger" onClick={toggleMenu} />
      <div className="logo">Druel</div>
      <nav className="nav-links">
        <NavLink to="/" exact activeClassName="active" onClick={() => setIsMenuOpen(false)}>
          <FaTachometerAlt />
          Dashboard
        </NavLink>
        <NavLink to="/Upload" activeClassName="active" onClick={() => setIsMenuOpen(false)}>
          <FaUpload />
          Upload
        </NavLink>
        <NavLink to="/Analysis" activeClassName="active" onClick={() => setIsMenuOpen(false)}>
          <FaChartBar />
          Analysis
        </NavLink>
        <NavLink to="/Report" activeClassName="active" onClick={() => setIsMenuOpen(false)}>
          <FaFileAlt />
          Report
        </NavLink>
      </nav>
      <div className="logout-btn">
        <FaSignOutAlt />
        Logout
      </div>
    </div>
  );
}

export default Navbar;
