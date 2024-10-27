import React from 'react';
import FlightIcon from '@mui/icons-material/Flight';
import '../static/styles/loader.css';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader">
        <FlightIcon className="spinner-icon" />
      </div>
    </div>
  );
};

export default Loader;
