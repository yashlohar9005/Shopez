import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';

const Products = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('search') || '';
  const pageNumber = searchParams.get('page') || 1;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters state
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');

  useEffect(() => {
    // Fetch categories for the filter dropdown
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page: pageNumber,
          sort: sort
        };
        
        if (keyword) params.search = keyword;
        if (category) params.category = category;

        const data = await productService.getProducts(params);
        setProducts(data.products || []);
        setPagination(data.pagination || {});
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // Scroll to top when page/filters change
    window.scrollTo(0, 0);
  }, [keyword, pageNumber, category, sort]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">
          {keyword ? `Search Results for "${keyword}"` : 'All Products'}
        </h2>
        
        {/* Filters & Sort */}
        <div className="d-flex gap-2">
          <select 
            className="form-select form-select-sm w-auto"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          
          <select 
            className="form-select form-select-sm w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="-createdAt">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-ratings">Highest Rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : products.length === 0 ? (
        <div className="alert alert-info text-center py-5">
          <i className="bi bi-search fs-1 d-block mb-3"></i>
          No products found matching your criteria.
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
            {products.map((product) => (
              <div className="col" key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <Pagination 
            pages={pagination.pages} 
            page={pagination.page} 
            keyword={keyword} 
          />
        </>
      )}
    </div>
  );
};

export default Products;
