import React from 'react';

const Loader = ({ size = '3rem', text = 'Loading...', fullScreen = false }) => {
  const containerStyle = fullScreen 
    ? { height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 9999 }
    : { height: '50vh' };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={containerStyle}>
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: size, height: size }}>
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <h5 className="text-muted fw-bold">{text}</h5>}
    </div>
  );
};

export default Loader;
