import React from 'react';
import { Link } from 'react-router-dom';

const Pagination = ({ pages, page, keyword = '' }) => {
  if (pages <= 1) return null;

  // Build the base URL based on whether there's a search keyword or not
  const getPageUrl = (pageNumber) => {
    if (keyword) {
      return `/products?search=${keyword}&page=${pageNumber}`;
    }
    return `/products?page=${pageNumber}`;
  };

  return (
    <nav aria-label="Product pagination" className="mt-4">
      <ul className="pagination justify-content-center">
        {/* Previous Button */}
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <Link className="page-link" to={getPageUrl(page - 1)} tabIndex="-1">
            Previous
          </Link>
        </li>

        {/* Page Numbers */}
        {[...Array(pages).keys()].map((x) => (
          <li key={x + 1} className={`page-item ${x + 1 === page ? 'active' : ''}`}>
            <Link className="page-link" to={getPageUrl(x + 1)}>
              {x + 1}
            </Link>
          </li>
        ))}

        {/* Next Button */}
        <li className={`page-item ${page === pages ? 'disabled' : ''}`}>
          <Link className="page-link" to={getPageUrl(page + 1)}>
            Next
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
