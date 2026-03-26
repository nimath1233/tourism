import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleNav = () => setIsOpen(!isOpen);

  const isActive = (path) => location.pathname === path ? 'active' : '';
  
  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand">TourEase</Link>
        <button className="nav-toggle" aria-label="Toggle navigation" onClick={toggleNav}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav className={`nav ${isOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/book" className={`nav-link ${isActive('/book')} new-badge-link`} onClick={() => setIsOpen(false)} style={{ color: 'var(--primary-700)', fontWeight: 'bold' }}>Plan a Trip</Link>
          <a href="/#about" className="nav-link" onClick={() => setIsOpen(false)}>About</a>
          <a href="/#services" className="nav-link" onClick={() => setIsOpen(false)}>Services</a>
          <a href="/#contact" className="nav-link" onClick={() => setIsOpen(false)}>Contact</a>
          
          {isLoggedIn ? (
            <>
              <Link to="/drivers" className="nav-link" onClick={() => setIsOpen(false)}>🚗 View Vehicles</Link>
              <Link to="/dashboard" className="nav-link" style={{ fontWeight: 600, color: 'var(--primary-700)' }} onClick={() => setIsOpen(false)}>Profile / Dashboard</Link>
              <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '8px 16px', marginLeft: '8px' }}>Logout</button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary" onClick={() => setIsOpen(false)}>Login / Register</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
