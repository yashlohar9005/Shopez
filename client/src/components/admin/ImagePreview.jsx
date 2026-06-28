import React, { useState } from 'react';
import api from '../../services/api';

const ImagePreview = ({ images, onRemoveSuccess }) => {
  const [removingId, setRemovingId] = useState(null);

  if (!images || images.length === 0) return null;

  const handleRemove = async (publicId) => {
    if (!publicId) return; // For mock data or external URLs without publicId
    
    try {
      setRemovingId(publicId);
      // We must URI encode it because it contains slashes (e.g. shopez/products/abc)
      await api.delete(`/upload/${encodeURIComponent(publicId)}`);
      onRemoveSuccess(publicId);
    } catch (err) {
      alert(`Failed to delete image: ${err.toString()}`);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="mb-4">
      <h6 className="fw-bold small text-muted mb-3">Uploaded Images ({images.length})</h6>
      <div className="row g-3">
        {images.map((img, index) => (
          <div className="col-auto" key={img.publicId || index}>
            <div className="position-relative d-inline-block border rounded p-1 bg-white shadow-sm">
              <img 
                src={img.url} 
                alt="Product preview" 
                className="rounded object-fit-cover"
                style={{ width: '100px', height: '100px' }}
              />
              {img.publicId && (
                <button 
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle shadow"
                  style={{ width: '28px', height: '28px', padding: 0 }}
                  onClick={() => handleRemove(img.publicId)}
                  disabled={removingId === img.publicId}
                  title="Remove Image"
                >
                  {removingId === img.publicId ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <i className="bi bi-x-lg"></i>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;
