import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminService from '../../services/adminService';
import InventoryTable from '../../components/admin/InventoryTable';
import StockUpdateModal from '../../components/admin/StockUpdateModal';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import StatsCard from '../../components/admin/StatsCard';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = searchParams.get('page') || 1;
  const currentFilter = searchParams.get('filter') || '';
  
  const [modalProduct, setModalProduct] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, [pageNumber, currentFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getInventory({ page: pageNumber, limit: 10, filter: currentFilter });
      setProducts(data.products || []);
      setPagination(data.pagination || {});
      setSummary(data.summary || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (filterName) => {
    if (filterName === currentFilter) {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', filterName);
    }
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handleUpdateStock = async (product, change) => {
    if (change === 'modal') {
      setModalProduct(product);
      return;
    }

    try {
      await adminService.updateProductStock(product._id, change);
      fetchInventory(); // Soft refresh
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleModalSave = async (productId, newStockValue) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    const change = newStockValue - product.stock;
    if (change === 0) {
      setModalProduct(null);
      return;
    }

    try {
      await adminService.updateProductStock(productId, change);
      setModalProduct(null);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="pb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-dark">Inventory Management</h2>
          <p className="text-muted mb-0 small">Monitor and update product stock levels</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm shadow-sm" onClick={fetchInventory}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

      {summary && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div 
              className={`card h-100 shadow-sm border-0 cursor-pointer ${currentFilter === '' ? 'ring-2 ring-primary bg-primary text-white' : 'bg-white'}`}
              onClick={() => setFilter('')}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body">
                <h6 className="text-uppercase fw-bold opacity-75 mb-1" style={{ fontSize: '0.75rem' }}>All Products</h6>
                <h3 className="mb-0 fw-bold">{summary.totalProducts}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div 
              className={`card h-100 shadow-sm border-0 ${currentFilter === 'in_stock' ? 'bg-success text-white' : 'bg-white'}`}
              onClick={() => setFilter('in_stock')}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body">
                <h6 className="text-uppercase fw-bold opacity-75 mb-1" style={{ fontSize: '0.75rem' }}>In Stock</h6>
                <h3 className="mb-0 fw-bold">{summary.inStock}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div 
              className={`card h-100 shadow-sm border-0 ${currentFilter === 'low_stock' ? 'bg-warning text-dark' : 'bg-white'}`}
              onClick={() => setFilter('low_stock')}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body">
                <h6 className="text-uppercase fw-bold opacity-75 mb-1" style={{ fontSize: '0.75rem' }}>Low Stock (&lt;5)</h6>
                <h3 className="mb-0 fw-bold">{summary.lowStock}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div 
              className={`card h-100 shadow-sm border-0 ${currentFilter === 'out_of_stock' ? 'bg-danger text-white' : 'bg-white'}`}
              onClick={() => setFilter('out_of_stock')}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body">
                <h6 className="text-uppercase fw-bold opacity-75 mb-1" style={{ fontSize: '0.75rem' }}>Out of Stock</h6>
                <h3 className="mb-0 fw-bold">{summary.outOfStock}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <>
          <InventoryTable products={products} onUpdateStock={handleUpdateStock} />
          
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing <span className="fw-bold text-dark">{products.length}</span> of <span className="fw-bold text-dark">{pagination.total}</span> records
            </div>
            <Pagination pages={pagination.pages} page={pagination.page} isAdmin={true} />
          </div>
        </>
      )}

      <StockUpdateModal 
        show={!!modalProduct} 
        product={modalProduct} 
        onClose={() => setModalProduct(null)} 
        onSave={handleModalSave}
      />
    </div>
  );
};

export default Inventory;
