import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!show) return null;

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
      <div className={`toast show align-items-center text-white bg-${type} border-0`} role="alert">
        <div className="d-flex">
          <div className="toast-body">
            {message}
          </div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShow(false)} aria-label="Close"></button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
