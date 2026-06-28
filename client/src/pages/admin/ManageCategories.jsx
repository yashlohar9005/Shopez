import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import Loader from '../../components/Loader';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCategories();
      setCategories(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setCurrentId(category._id);
    setName(category.name);
    setDescription(category.description || '');
    setImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setDescription('');
    setImage(null);
  };

  const handleDelete = async (id, categoryName) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      try {
        await adminService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert(err.response?.data?.message || err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      // Create FormData if image is present
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (image) {
        formData.append('image', image);
      }

      if (isEditing) {
        await adminService.updateCategory(currentId, formData);
      } else {
        await adminService.createCategory(formData);
      }
      
      handleCancelEdit();
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="pb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-dark">Manage Categories</h2>
          <p className="text-muted mb-0 small">Create and edit product categories</p>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-bottom border-light py-3">
              <h6 className="mb-0 fw-bold">{isEditing ? 'Edit Category' : 'Create New Category'}</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium">Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Laptops"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-medium">Description</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief category description..."
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-medium">Category Image</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                  <div className="form-text">Leave empty to keep existing image (if editing)</div>
                </div>
                
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                    {submitLoading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...</>
                    ) : (
                      <><i className={`bi bi-${isEditing ? 'check-circle' : 'plus-circle'} me-2`}></i>{isEditing ? 'Save Changes' : 'Create Category'}</>
                    )}
                  </button>
                  {isEditing && (
                    <button type="button" className="btn btn-light border text-secondary" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* List Column */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-bottom border-light py-3">
              <h6 className="mb-0 fw-bold">All Categories</h6>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="p-5"><Loader /></div>
              ) : categories.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-tags text-muted opacity-50 mb-3 d-block" style={{ fontSize: '3rem' }}></i>
                  <h6 className="text-muted">No categories found. Create one to get started.</h6>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Category</th>
                        <th>Slug</th>
                        <th>Products</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category._id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <img 
                                src={category.image?.url || 'https://via.placeholder.com/40'} 
                                alt={category.name}
                                className="rounded me-3 object-fit-cover shadow-sm bg-white border"
                                style={{ width: '40px', height: '40px' }}
                              />
                              <div>
                                <div className="fw-bold text-dark">{category.name}</div>
                                <div className="text-muted small text-truncate" style={{ maxWidth: '150px' }}>
                                  {category.description || 'No description'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-muted font-monospace small">{category.slug}</td>
                          <td>
                            <span className="badge bg-secondary bg-opacity-25 text-dark">
                              {category.productCount || 0} items
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <div className="btn-group shadow-sm">
                              <button 
                                className="btn btn-sm btn-light border text-primary"
                                onClick={() => handleEdit(category)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-light border text-danger"
                                onClick={() => handleDelete(category._id, category.name)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;
