import React, { useState } from 'react';
import productsApi from '../api/products';
import './product-row.css';

export default function ProductRow({ product, onSelect, onUpdated, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
  
    name: product.name || '',
    unit: product.unit || '',
    category: product.category || '',
    brand: product.brand || '',
    stock: product.stock ?? 0,
    status: product.status || (product.stock > 0 ? 'In Stock' : 'Out of Stock'),
  });

  const handleChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const save = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      const payload = { ...form };
      // Ensure `status` is always provided (backend validation requires it)
      if (!payload.status || String(payload.status).trim() === '') {
        const computed = getStockStatus(payload.stock);
        payload.status = computed.label;
      }
      const updated = await productsApi.updateProduct(product.id, payload);
      onUpdated(product.id, updated);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert('Save failed: ' + (err.message || 'Please try again'));
    } finally {
      setIsLoading(false);
    }
  };

  const cancel = (e) => {
    e.stopPropagation();
    setForm({ 
      
      name: product.name, 
      unit: product.unit, 
      category: product.category, 
      brand: product.brand, 
      stock: product.stock,
      status: product.status || (product.stock > 0 ? 'In Stock' : 'Out of Stock')
    });
    setEditing(false);
  };

  const startEditing = (e) => {
    e.stopPropagation();
    // Initialize form from latest product values to avoid stale state
    setForm({
      name: product.name || '',
      unit: product.unit || '',
      category: product.category || '',
      brand: product.brand || '',
      stock: product.stock ?? 0,
      status: product.status || (product.stock > 0 ? 'In Stock' : 'Out of Stock'),
    });
    setEditing(true);
  };

  const doDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      if (onDelete) onDelete(product.id);
    }
  };

  const getStockStatus = (stock) => {
    if (stock > 10) return { label: 'In Stock', class: 'in-stock' };
    if (stock > 0) return { label: 'Low Stock', class: 'low-stock' };
    return { label: 'Out of Stock', class: 'out-of-stock' };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <tr className={`product-row ${editing ? 'editing' : ''}`} onClick={!editing ? onSelect : undefined}>
      <td className="cell-img">
        <div className="product-image">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }} 
            />
          ) : null}
          <div className="image-placeholder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </td>
      
      <td className="cell-name">
        {editing ? (
          <input 
            value={form.name} 
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Product name"
            disabled={isLoading}
          />
        ) : (
          <div className="product-name">
            <span className="name-text">{product.name}</span>
            {product.brand && <span className="brand-text">{product.brand}</span>}
          </div>
        )}
      </td>
      
      <td className="cell-unit">
        {editing ? (
          <select 
            value={form.unit} 
            onChange={(e) => handleChange('unit', e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select unit</option>
            <option value="pcs">Pieces</option>
            <option value="kg">Kilograms</option>
            <option value="g">Grams</option>
            <option value="L">Liters</option>
            <option value="ml">Milliliters</option>
            <option value="box">Box</option>
            <option value="pack">Pack</option>
          </select>
        ) : (
          <span className="unit-badge">{product.unit || '-'}</span>
        )}
      </td>
      
      <td className="cell-category">
        {editing ? (
          <input 
            value={form.category} 
            onChange={(e) => handleChange('category', e.target.value)}
            placeholder="Category"
            disabled={isLoading}
          />
        ) : (
          <span className="category-tag">{product.category || '-'}</span>
        )}
      </td>
      
      <td className="cell-brand">
        {editing ? (
          <input
            value={form.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="Brand"
            disabled={isLoading}
          />
        ) : (
          <span className="brand-tag">{product.brand || '-'}</span>
        )}
      </td>
      
      <td className="cell-stock">
        {editing ? (
          <input 
            type="number" 
            value={form.stock} 
            onChange={(e) => handleChange('stock', Number(e.target.value))}
            min="0"
            disabled={isLoading}
            className="stock-input"
          />
        ) : (
          <div className="stock-display">
            <span className="stock-value">{product.stock}</span>
            <span className="stock-unit">{product.unit}</span>
          </div>
        )}
      </td>
      
      <td className="cell-status">
        <span className={`status-badge ${stockStatus.class}`}>
          {stockStatus.label}
        </span>
      </td>
      
      <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
        {editing ? (
          <div className="action-buttons">
            <button 
              className="btn btn-success" 
              onClick={save}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 5H3V19H21V5ZM5 17L7.5 10L10 13.5L14.5 7L19 17H5Z" fill="currentColor"/>
                </svg>
              )}
              Save
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={cancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="action-buttons">
            <button 
              className="btn btn-primary" 
              onClick={startEditing}
            >
              <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
              </svg>
              Edit
            </button>
            <button 
              className="btn btn-danger" 
              onClick={doDelete}
            >
              <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
              </svg>
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}