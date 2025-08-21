import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../Navbar.css';

function Navbar() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">AlgoWhiz</div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/track">Track Problems</Link>
        <Link to="/problems">Problem List</Link>
        <Link to="/login">Logout</Link>
      </div>
    </nav>
  );
}

export default Navbar;