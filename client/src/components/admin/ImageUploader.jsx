import React, { useState, useRef } from 'react';
import api from '../../services/api';

const ImageUploader = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate files (size and type)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        return setError(`Invalid file type: ${file.name}. Only JPG, PNG, WEBP allowed.`);
      }
      if (file.size > maxSize) {
        return setError(`File too large: ${file.name}. Max size is 5MB.`);
      }
    }

    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setError(null);
    setUploading(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      // Assuming api wrapper automatically sets Content-Type to multipart/form-data when passing FormData
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onUploadSuccess(response.data); // Array of {url, publicId}
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    } catch (err) {
      setError(err.toString());
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  return (
    <div className="mb-4">
      <label className="form-label fw-bold small text-muted">Upload Product Images</label>
      
      <div 
        className={`border-2 border-dashed rounded-3 p-5 text-center ${uploading ? 'bg-light opacity-50' : 'bg-white'}`}
        style={{ borderColor: '#dee2e6', transition: 'all 0.3s' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        role="button"
      >
        <input 
          type="file" 
          multiple 
          accept="image/jpeg, image/png, image/webp, image/jpg"
          className="d-none" 
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
        />
        
        {uploading ? (
          <div>
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="m-0 text-muted">Uploading to Cloudinary...</p>
          </div>
        ) : (
          <div>
            <i className="bi bi-cloud-arrow-up text-primary mb-3 d-block" style={{ fontSize: '3rem' }}></i>
            <h5 className="fw-bold">Click or drag images here to upload</h5>
            <p className="text-muted small m-0">Supports JPG, PNG, WEBP up to 5MB</p>
          </div>
        )}
      </div>

      {error && <div className="text-danger small mt-2"><i className="bi bi-exclamation-triangle"></i> {error}</div>}
    </div>
  );
};

export default ImageUploader;
