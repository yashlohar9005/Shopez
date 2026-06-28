import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import ReviewTable from '../../components/admin/ReviewTable';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');

  const searchParams = new URLSearchParams(window.location.search);
  const pageNumber = searchParams.get('page') || 1;

  useEffect(() => {
    fetchReviews();
  }, [pageNumber, filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: pageNumber, limit: 15 };
      if (searchTerm) params.search = searchTerm;
      
      if (filter === 'pending') { params.isApproved = 'false'; params.isSpam = 'false'; }
      if (filter === 'approved') params.isApproved = 'true';
      if (filter === 'spam') params.isSpam = 'true';

      const data = await adminService.getReviews(params);
      setReviews(data.reviews || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleToggleApproval = async (id) => {
    try {
      await adminService.toggleReviewApproval(id);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleToggleSpam = async (id) => {
    try {
      await adminService.toggleReviewSpam(id);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteReview(id);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="pb-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 text-dark">Manage Reviews</h2>
          <p className="text-muted mb-0 small">Moderate customer reviews and feedback</p>
        </div>
        
        {/* Filters and Search */}
        <div className="d-flex flex-column flex-md-row gap-2">
          <select 
            className="form-select border-0 shadow-sm text-muted" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="">All Reviews</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="spam">Marked as Spam</option>
          </select>
          
          <form onSubmit={handleSearch} className="d-flex">
            <div className="input-group shadow-sm rounded-3 overflow-hidden">
              <input 
                type="text" 
                className="form-control border-0" 
                placeholder="Search reviews..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary border-0 px-3" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <>
          <ReviewTable 
            reviews={reviews} 
            onToggleApproval={handleToggleApproval}
            onToggleSpam={handleToggleSpam}
            onDelete={handleDelete}
          />
          
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing <span className="fw-bold text-dark">{reviews.length}</span> of <span className="fw-bold text-dark">{pagination.total}</span> reviews
            </div>
            <Pagination pages={pagination.pages} page={pagination.page} isAdmin={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default ManageReviews;
