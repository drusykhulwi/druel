import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUpload, FaSignOutAlt, FaChartBar, FaFileAlt, FaTachometerAlt, FaBars, FaTimes } from 'react-icons/fa';

import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navbar">
      <div className="hamburger" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </div>
      <div className="logo">Druel</div>
      <nav className={`nav-links ${isMenuOpen ? 'mobile-active' : ''}`}>
        <NavLink to="/" exact activeClassName="active" onClick={toggleMenu}>
          <FaTachometerAlt />
          Dashboard
        </NavLink>
        <NavLink to="/Upload" activeClassName="active" onClick={toggleMenu}>
          <FaUpload />
          Upload
        </NavLink>
        <NavLink to="/Analysis" activeClassName="active" onClick={toggleMenu}>
          <FaChartBar />
          Analysis
        </NavLink>
        <NavLink to="/Report" activeClassName="active" onClick={toggleMenu}>
          <FaFileAlt />
          Report
        </NavLink>
        <div className="mobile-logout">
          <FaSignOutAlt />
          Logout
        </div>
      </nav>
      <div className="logout-btn">
        <FaSignOutAlt />
        Logout
      </div>
    </div>
  );
}

export default Navbar;