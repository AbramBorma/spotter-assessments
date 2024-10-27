import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../static/styles/navbar.css';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';

const Navbar = () => {
  const navigate = useNavigate();

  const handleFlightClick = () => {
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="logo">
        <span className="menu-icon"><AirplaneTicketIcon/></span>
        <span className="brand-name">Spotter Flights</span>
      </div>
      <div className="nav-items">
        <button className="flight-btn" onClick={handleFlightClick}>
          <span className="flight-icon">✈️</span> Flights
        </button>
      </div>
    </header>
  );
};

export default Navbar;