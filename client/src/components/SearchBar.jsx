import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      // Redirect to products page with search query
      navigate(`/products?search=${keyword.trim()}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <form onSubmit={submitHandler} className="d-flex w-100">
      <div className="input-group">
        <input
          type="text"
          name="q"
          onChange={(e) => setKeyword(e.target.value)}
          value={keyword}
          placeholder="Search products..."
          className="form-control"
          aria-label="Search Products"
        />
        <button type="submit" className="btn btn-outline-primary bg-white text-primary">
          <i className="bi bi-search"></i> Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
