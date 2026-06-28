import React from 'react';

const ErrorMessage = ({ message, type = 'danger' }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type} d-flex align-items-center mb-4`} role="alert">
      <i className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
      <div>{message}</div>
    </div>
  );
};

export default ErrorMessage;
