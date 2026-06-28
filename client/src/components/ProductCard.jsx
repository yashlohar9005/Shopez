import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useWishlist from '../hooks/useWishlist';
import useAuth from '../hooks/useAuth';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist, loading } = useWishlist();
  const { isAuthenticated } = useAuth();
  // Determine if product is in stock
  const inStock = product.stock > 0;
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <div className="card h-100 shadow-sm product-card border-0">
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="text-decoration-none">
        <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
          <img
            src={product.images && product.images.length > 0 ? product.images[0].url : 'https://placehold.co/300x200/EEEEEE/31343C?text=No+Image'}
            className="card-img-top w-100 h-100 object-fit-cover transition-transform hover-scale"
            alt={product.name}
          />
          {/* Wishlist Button */}
          <button
            className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
            style={{ width: '32px', height: '32px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAuthenticated) {
                navigate('/login?redirect=/products');
                return;
              }
              toggleWishlist(product._id).catch(err => alert(err.toString()));
            }}
            disabled={loading}
          >
            <i className={`bi ${isInWishlist(product._id) ? 'bi-heart-fill text-danger' : 'bi-heart text-muted'}`}></i>
          </button>
          
          {/* Stock Badge */}
          {!inStock && (
            <span className="position-absolute top-0 start-0 m-2 badge bg-danger">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="card-body d-flex flex-column">
        {/* Brand / Category */}
        <div className="text-muted small mb-1">
          {product.brand || (product.category && product.category.name) || 'Shopez'}
        </div>
        
        {/* Title */}
        <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
          <h5 className="card-title text-truncate" title={product.name}>
            {product.name}
          </h5>
        </Link>

        {/* Rating */}
        <div className="mb-2 d-flex align-items-center">
          <div className="text-warning me-2">
            {[...Array(5)].map((_, i) => (
              <i 
                key={i} 
                className={`bi ${i < Math.floor(product.averageRating || 0) ? 'bi-star-fill' : i < (product.averageRating || 0) ? 'bi-star-half' : 'bi-star'}`}
              ></i>
            ))}
          </div>
          <small className="text-muted">({product.numReviews || 0})</small>
        </div>

        {/* Price & Action */}
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="fs-5 fw-bold text-primary">{formattedPrice}</span>
          <Link 
            to={`/product/${product._id}`}
            className="btn btn-sm btn-outline-primary rounded-circle"
            title="View Details"
          >
            <i className="bi bi-eye"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
