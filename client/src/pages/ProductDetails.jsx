import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import Loader from '../components/Loader';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import useWishlist from '../hooks/useWishlist';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState('');
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0].url);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/product/' + id);
      return;
    }
    
    try {
      await addToCart(product._id, qty);
      navigate('/cart');
    } catch (err) {
      alert(err.toString());
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-danger m-5">{error}</div>;
  if (!product) return <div className="alert alert-info m-5">Product not found</div>;

  const inStock = product.stock > 0;
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <div className="container py-4">
      <Link to="/products" className="btn btn-light mb-4">
        <i className="bi bi-arrow-left"></i> Back to Products
      </Link>

      <div className="row bg-white p-4 rounded shadow-sm">
        {/* Images Column */}
        <div className="col-md-5 mb-4 mb-md-0">
          <div className="border rounded mb-3 overflow-hidden d-flex justify-content-center align-items-center" style={{ height: '400px', backgroundColor: '#f8f9fa' }}>
            <img 
              src={mainImage || 'https://placehold.co/500x400/EEEEEE/31343C?text=No+Image'} 
              alt={product.name} 
              className="img-fluid object-fit-contain w-100 h-100" 
            />
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="d-flex gap-2 overflow-auto py-2">
              {product.images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`border rounded cursor-pointer ${mainImage === img.url ? 'border-primary border-2' : ''}`}
                  style={{ width: '80px', height: '80px', flexShrink: 0 }}
                  onClick={() => setMainImage(img.url)}
                >
                  <img src={img.url} className="w-100 h-100 object-fit-cover" alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="col-md-4 px-md-4">
          <div className="text-muted small mb-2 text-uppercase tracking-wide">
            {product.brand} | {product.category?.name}
          </div>
          <h2 className="fw-bold mb-3">{product.name}</h2>
          
          {/* Rating */}
          <div className="mb-3 d-flex align-items-center">
            <div className="text-warning fs-5 me-2">
              {[...Array(5)].map((_, i) => (
                <i 
                  key={i} 
                  className={`bi ${i < Math.floor(product.averageRating || 0) ? 'bi-star-fill' : i < (product.averageRating || 0) ? 'bi-star-half' : 'bi-star'}`}
                ></i>
              ))}
            </div>
            <span className="text-muted">{Number(product.averageRating || 0).toFixed(1)} rating ({product.numReviews || 0} reviews)</span>
          </div>

          <hr />
          
          <p className="lead text-secondary" style={{ fontSize: '1.05rem' }}>{product.description}</p>

          {product.specifications && product.specifications.length > 0 && (
            <div className="mt-4">
              <h5 className="fw-bold mb-3 text-dark d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
                <i className="bi bi-list-stars me-2 text-primary fs-5"></i>
                Specifications
              </h5>
              <div className="border rounded-3 overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
                {product.specifications.map((spec, idx) => (
                  <div 
                    key={idx} 
                    className={`d-flex justify-content-between align-items-center p-2 px-3 ${idx % 2 === 0 ? 'bg-light' : 'bg-white'}`}
                    style={{ borderBottom: idx < product.specifications.length - 1 ? '1px solid #e2e8f0' : 'none' }}
                  >
                    <span className="text-secondary small fw-semibold">{spec.name}</span>
                    <span className="text-dark small fw-medium text-end ms-3">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Column */}
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body">
              <h3 className="card-title text-primary fw-bold mb-3">{formattedPrice}</h3>
              
              <div className="mb-3 d-flex justify-content-between">
                <span>Status:</span>
                <span className={`fw-bold ${inStock ? 'text-success' : 'text-danger'}`}>
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {inStock && (
                <div className="mb-4 d-flex justify-content-between align-items-center">
                  <span>Quantity:</span>
                  <select 
                    className="form-select w-auto" 
                    value={qty} 
                    onChange={(e) => setQty(Number(e.target.value))}
                  >
                    {/* Show up to 10 or max stock */}
                    {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                className="btn btn-primary w-100 py-2 rounded-pill fw-bold mb-2"
                disabled={!inStock}
                onClick={handleAddToCart}
              >
                <i className="bi bi-cart-plus me-2"></i> Add to Cart
              </button>
              
              <button 
                className={`btn w-100 py-2 rounded-pill fw-bold ${isInWishlist(product._id) ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
                disabled={wishlistLoading}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login?redirect=/product/' + id);
                    return;
                  }
                  toggleWishlist(product._id).catch(err => alert(err.toString()));
                }}
              >
                <i className={`bi ${isInWishlist(product._id) ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i> 
                {isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
