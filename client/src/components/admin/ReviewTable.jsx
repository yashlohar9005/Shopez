import React from 'react';
import { Link } from 'react-router-dom';

const ReviewTable = ({ reviews, onToggleApproval, onToggleSpam, onDelete }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-star text-muted opacity-50 mb-3 d-block" style={{ fontSize: '3rem' }}></i>
          <h5 className="text-muted">No reviews found.</h5>
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    return (
      <div className="text-warning small">
        {[...Array(5)].map((_, index) => (
          <i key={index} className={`bi bi-star${index < rating ? '-fill' : ''}`}></i>
        ))}
      </div>
    );
  };

  return (
    <div className="table-responsive bg-white rounded-3 shadow-sm border-0">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col" className="ps-4 py-3">Product / User</th>
            <th scope="col" className="py-3">Rating</th>
            <th scope="col" className="py-3 w-25">Comment</th>
            <th scope="col" className="py-3">Date</th>
            <th scope="col" className="py-3">Status</th>
            <th scope="col" className="text-end pe-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => {
            const isSpam = review.isSpam;
            const isApproved = review.isApproved;
            
            return (
              <tr key={review._id} className={isSpam ? 'table-danger' : !isApproved ? 'table-warning' : ''}>
                <td className="ps-4 py-3">
                  <div className="d-flex align-items-center mb-2">
                    <img 
                      src={review.product?.images?.[0]?.url || 'https://via.placeholder.com/32'} 
                      alt={review.product?.name}
                      className="rounded me-2 object-fit-cover shadow-sm bg-white"
                      style={{ width: '32px', height: '32px' }}
                    />
                    <div className="text-truncate fw-medium" style={{ maxWidth: '150px' }} title={review.product?.name}>
                      <Link to={`/product/${review.product?._id}`} className="text-decoration-none text-dark" target="_blank">
                        {review.product?.name || 'Unknown Product'}
                      </Link>
                    </div>
                  </div>
                  <div className="text-muted small d-flex align-items-center">
                    <i className="bi bi-person-circle me-1"></i>
                    <span className="text-truncate" style={{ maxWidth: '150px' }}>{review.user?.name || 'Guest User'}</span>
                  </div>
                </td>
                <td className="py-3">
                  {renderStars(review.rating)}
                </td>
                <td className="py-3 text-muted small">
                  <div style={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} title={review.comment}>
                    "{review.comment}"
                  </div>
                </td>
                <td className="py-3 text-muted small">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3">
                  {isSpam ? (
                    <span className="badge rounded-pill bg-danger"><i className="bi bi-shield-x me-1"></i>Spam</span>
                  ) : isApproved ? (
                    <span className="badge rounded-pill bg-success"><i className="bi bi-check-circle me-1"></i>Approved</span>
                  ) : (
                    <span className="badge rounded-pill bg-warning text-dark"><i className="bi bi-hourglass me-1"></i>Pending</span>
                  )}
                </td>
                <td className="text-end pe-4 py-3">
                  <div className="dropdown">
                    <button className="btn btn-sm btn-light border" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                      <li>
                        <button className="dropdown-item py-2" onClick={() => onToggleApproval(review._id)}>
                          <i className={`bi ${isApproved ? 'bi-x-circle text-warning' : 'bi-check-circle text-success'} me-2`}></i>
                          {isApproved ? 'Mark as Pending' : 'Approve Review'}
                        </button>
                      </li>
                      <li>
                        <button className="dropdown-item py-2" onClick={() => onToggleSpam(review._id)}>
                          <i className={`bi ${isSpam ? 'bi-shield-check text-success' : 'bi-shield-x text-danger'} me-2`}></i>
                          {isSpam ? 'Remove Spam Flag' : 'Mark as Spam'}
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          className="dropdown-item py-2 text-danger" 
                          onClick={() => {
                            if(window.confirm('Are you sure you want to delete this review?')) {
                              onDelete(review._id);
                            }
                          }}
                        >
                          <i className="bi bi-trash me-2"></i> Delete Review
                        </button>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewTable;
