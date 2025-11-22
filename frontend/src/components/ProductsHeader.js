import React from 'react';
import './products-header.css';

export default function ProductsHeader({ 
  query, 
  onQueryChange, 
  categories, 
  category, 
  onCategoryChange, 
  onAdd, 
  onImport, 
  onExport 
}) {
  return (
    <header className="products-header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-title">
            <svg className="header-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
              <path d="M12 12H14V14H12V12ZM8 12H10V14H8V12ZM16 12H18V14H16V12Z" fill="currentColor"/>
            </svg>
            <div>
              <h1>Product Inventory</h1>
              <p>Manage your products and stock levels</p>
            </div>
          </div>
        </div>

        <div className="header-right">
          <button className="btn btn-export" onClick={onExport}>
            <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="currentColor"/>
            </svg>
            Export
          </button>
          <button className="btn btn-import" onClick={onImport}>
            <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16V10H5L12 3L19 10H15V16H9ZM5 20V18H19V20H5Z" fill="currentColor"/>
            </svg>
            Import
          </button>
          <button className="btn btn-primary" onClick={onAdd}>
            <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
            </svg>
            Add Product
          </button>
        </div>
      </div>

      <div className="header-filters">
        <div className="search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
          </svg>
          <input 
            className="search-input" 
            placeholder="Search products by name, brand, or category..." 
            value={query} 
            onChange={(e) => onQueryChange(e.target.value)} 
          />
          {query && (
            <button 
              className="clear-search" 
              onClick={() => onQueryChange('')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </button>
          )}
        </div>

        <div className="filter-container">
          <svg className="filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor"/>
          </svg>
          <select 
            className="category-select" 
            value={category} 
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-stats">
          <span className="filter-text">
            {category ? `Filtered by: ${category}` : 'Showing all products'}
          </span>
        </div>
      </div>
    </header>
  );
}