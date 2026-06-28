import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import api from '../../services/api';
import ImageUploader from '../../components/admin/ImageUploader';
import ImagePreview from '../../components/admin/ImagePreview';

const CreateProduct = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    brand: '',
    category: '',
    stock: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadSuccess = (uploadedImages) => {
    // Append new uploaded images to the existing array
    setImages(prev => [...prev, ...uploadedImages]);
  };

  const handleRemoveSuccess = (publicId) => {
    setImages(prev => prev.filter(img => img.publicId !== publicId));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await adminService.createProduct({
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: images
      });
      navigate('/admin/products');
    } catch (err) {
      setError(err.toString());
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-3">
      <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">Create New Product</h5>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/admin/products')}>
          Cancel
        </button>
      </div>
      
      <div className="card-body p-4">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={submitHandler}>
          {/* Image Upload Section */}
          <div className="mb-4 bg-light p-3 rounded border">
            <ImageUploader onUploadSuccess={handleUploadSuccess} />
            <ImagePreview images={images} onRemoveSuccess={handleRemoveSuccess} />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">Product Name</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            
            <div className="col-md-3">
              <label className="form-label fw-bold small text-muted">Price (₹)</label>
              <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} required min="0" />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-bold small text-muted">Stock Count</label>
              <input type="number" className="form-control" name="stock" value={formData.stock} onChange={handleChange} required min="0" />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">Category</label>
              <select className="form-select" name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">Brand</label>
              <input type="text" className="form-control" name="brand" value={formData.brand} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold small text-muted">Description</label>
              <textarea className="form-control" name="description" rows="4" value={formData.description} onChange={handleChange} required></textarea>
            </div>
          </div>

          <div className="mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary px-4" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
