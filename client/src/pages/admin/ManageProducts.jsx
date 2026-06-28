import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import ProductTable from '../../components/admin/ProductTable';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Parse current page from URL
  const searchParams = new URLSearchParams(window.location.search);
  const pageNumber = searchParams.get('page') || 1;

  useEffect(() => {
    fetchProducts();
  }, [pageNumber]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: pageNumber, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      
      const data = await adminService.getProducts(params);
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteProduct(id);
      fetchProducts(); // Refresh list after deletion
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="pb-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 text-dark">Manage Products</h2>
          <p className="text-muted mb-0 small">Add, edit, or remove store products</p>
        </div>
        
        <div className="d-flex flex-column flex-md-row gap-2">
          <form onSubmit={handleSearch} className="d-flex">
            <div className="input-group shadow-sm rounded-3 overflow-hidden">
              <input 
                type="text" 
                className="form-control border-0" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-secondary border-0 px-3" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
          
          <Link to="/admin/product/create" className="btn btn-primary shadow-sm text-nowrap">
            <i className="bi bi-plus-lg me-1"></i> Add Product
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <>
          <ProductTable products={products} onDelete={handleDelete} />
          
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing <span className="fw-bold text-dark">{products.length}</span> of <span className="fw-bold text-dark">{pagination.total}</span> products
            </div>
            <Pagination pages={pagination.pages} page={pagination.page} isAdmin={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default ManageProducts;
