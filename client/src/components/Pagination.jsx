import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Pagination = ({ pages, page, keyword = '', onPageChange }) => {
  const location = useLocation();

  if (!pages || pages <= 1) return null;

  // Build the base URL preserving current path and query params
  const getPageUrl = (pageNumber) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', pageNumber);
    if (keyword) {
      searchParams.set('search', keyword);
    }
    return `${location.pathname}?${searchParams.toString()}`;
  };

  const handlePageClick = (e, pageNumber) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(pageNumber);
    }
  };

  const currentPage = Number(page) || 1;

  return (
    <nav aria-label="Page navigation" className="mt-4">
      <ul className="pagination justify-content-center mb-0">
        {/* Previous Button */}
        <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
          <Link 
            className="page-link" 
            to={getPageUrl(Math.max(1, currentPage - 1))} 
            tabIndex="-1"
            onClick={(e) => handlePageClick(e, Math.max(1, currentPage - 1))}
          >
            Previous
          </Link>
        </li>

        {/* Page Numbers */}
        {[...Array(pages).keys()].map((x) => {
          const pageNum = x + 1;
          return (
            <li key={pageNum} className={`page-item ${pageNum === currentPage ? 'active' : ''}`}>
              <Link 
                className="page-link" 
                to={getPageUrl(pageNum)}
                onClick={(e) => handlePageClick(e, pageNum)}
              >
                {pageNum}
              </Link>
            </li>
          );
        })}

        {/* Next Button */}
        <li className={`page-item ${currentPage >= pages ? 'disabled' : ''}`}>
          <Link 
            className="page-link" 
            to={getPageUrl(Math.min(pages, currentPage + 1))}
            onClick={(e) => handlePageClick(e, Math.min(pages, currentPage + 1))}
          >
            Next
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
