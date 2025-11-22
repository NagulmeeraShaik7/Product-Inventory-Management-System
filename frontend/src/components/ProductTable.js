import React from 'react';
import ProductRow from './ProductRow';
import './product-table.css';

export default function ProductTable({ products, loading, onSelectProduct, onUpdated, onDelete }) {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="table-empty">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="#e2e8f0"/>
            <path d="M12 12H14V14H12V12ZM8 12H10V14H8V12ZM16 12H18V14H16V12Z" fill="#e2e8f0"/>
          </svg>
        </div>
        <h3>No products found</h3>
        <p>Get started by adding your first product to the inventory.</p>
      </div>
    );
  }

  return (
    <div className="product-table-container">
      <div className="table-header">
        <div className="table-stats">
          <span className="product-count">{products.length} product{products.length !== 1 ? 's' : ''}</span>
          <span className="in-stock-count">
            {products.filter(p => p.stock > 0).length} in stock
          </span>
          <span className="out-of-stock-count">
            {products.filter(p => p.stock === 0).length} out of stock
          </span>
        </div>
      </div>
      
      <div className="table-scroll-container">
        <table className="product-table">
          <thead>
            <tr>
              <th className="column-image">Image</th>
              <th className="column-name">Product Name</th>
              <th className="column-unit">Unit</th>
              <th className="column-category">Category</th>
              <th className="column-brand">Brand</th>
              <th className="column-stock">Stock Level</th>
              <th className="column-status">Status</th>
              <th className="column-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow 
                key={p.id} 
                product={p} 
                onSelect={() => onSelectProduct(p)} 
                onUpdated={onUpdated} 
                onDelete={onDelete} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}