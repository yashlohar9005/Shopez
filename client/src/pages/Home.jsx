import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoading(true);
        // Fetch the newest 8 products
        const data = await productService.getProducts({ limit: 8, sort: '-createdAt' });
        setProducts(data.products || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="p-5 mb-5 bg-primary text-white rounded-3 shadow">
        <div className="container-fluid py-5 text-center">
          <h1 className="display-4 fw-bold">Welcome to SHOPEZ</h1>
          <p className="col-md-8 mx-auto fs-5 mt-3">
            Discover the latest trends in electronics, fashion, and more. 
            Premium quality products at unbeatable prices, delivered right to your door.
          </p>
          <Link to="/products" className="btn btn-light btn-lg mt-4 px-5 fw-bold text-primary rounded-pill">
            Shop Now
          </Link>
        </div>
      </div>

      {/* Latest Products Section */}
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h2 className="fw-bold m-0" style={{ color: '#333333' }}>Latest Arrivals</h2>
          <Link to="/products" className="text-decoration-none">View All <i className="bi bi-arrow-right"></i></Link>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {products.map((product) => (
              <div className="col" key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Features Section */}
      <div className="row mt-5 pt-5 text-center g-4">
        <div className="col-md-4">
          <div className="p-4 bg-white rounded shadow-sm h-100">
            <i className="bi bi-truck text-primary display-4 mb-3"></i>
            <h4>Free Shipping</h4>
            <p className="text-muted">On all orders over ₹500</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 bg-white rounded shadow-sm h-100">
            <i className="bi bi-shield-check text-primary display-4 mb-3"></i>
            <h4>Secure Payment</h4>
            <p className="text-muted">100% secure payment via Razorpay</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 bg-white rounded shadow-sm h-100">
            <i className="bi bi-arrow-return-left text-primary display-4 mb-3"></i>
            <h4>30 Days Return</h4>
            <p className="text-muted">If goods have problems</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
