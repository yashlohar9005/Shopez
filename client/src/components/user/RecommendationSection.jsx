import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import customerApiService from '../../services/customerApiService';
import ProductCard from '../ProductCard';
import Loader from '../Loader';

const RecommendationSection = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const data = await customerApiService.getRecommendations();
        setRecommendations(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading) return <Loader />;
  if (recommendations.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-top">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0"><i className="bi bi-stars text-warning me-2"></i>Recommended For You</h4>
        <Link to="/products" className="btn btn-outline-primary btn-sm rounded-pill px-3">View More</Link>
      </div>
      
      <div className="row g-4">
        {recommendations.map(product => (
          <div key={product._id} className="col-12 col-sm-6 col-lg-3">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationSection;
