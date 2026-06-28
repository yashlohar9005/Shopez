import React from 'react';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import useWishlist from '../../hooks/useWishlist';
import Loader from '../../components/Loader';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToCart = async (product) => {
    addToCart(product, 1);
    await handleRemove(product._id);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h3 className="fw-bold mb-4">My Wishlist</h3>
      
      {!wishlist || !wishlist.products || wishlist.products.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm">
          <i className="bi bi-heart fs-1 text-muted mb-3 d-block"></i>
          <h4 className="text-muted mb-4">Your wishlist is empty</h4>
          <Link to="/products" className="btn btn-primary px-4 rounded-pill">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {wishlist.products.map((item) => (
            <div key={item._id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 position-relative">
                <button 
                  onClick={() => handleRemove(item.product._id)}
                  className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle"
                  title="Remove from wishlist"
                >
                  <i className="bi bi-x-lg text-danger"></i>
                </button>
                <img 
                  src={item.product.images[0]?.url || 'https://via.placeholder.com/300'} 
                  className="card-img-top" 
                  alt={item.product.name}
                  style={{ height: '200px', objectFit: 'contain', padding: '1rem' }}
                />
                <div className="card-body border-top d-flex flex-column">
                  <h6 className="card-title text-truncate mb-1">{item.product.name}</h6>
                  <p className="card-text fw-bold text-primary mb-3">₹{item.product.price.toLocaleString()}</p>
                  
                  {item.product.stock > 0 ? (
                    <button 
                      onClick={() => handleMoveToCart(item.product)}
                      className="btn btn-outline-primary mt-auto w-100"
                    >
                      Move to Cart
                    </button>
                  ) : (
                    <button className="btn btn-secondary mt-auto w-100" disabled>
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
