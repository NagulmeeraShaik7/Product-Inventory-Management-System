import React, { useState, useEffect } from 'react';
import './add-product-modal.css';

export default function AddProductModal({ visible, onClose, onAdded }) {
  const [form, setForm] = useState({ 
    name: '', 
    unit: '', 
    category: '', 
    brand: '', 
    stock: 0 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setForm({ name: '', unit: '', category: '', brand: '', stock: 0 });
      setErrors({});
    }
  }, [visible]);

  const change = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    // Clear error when user starts typing
    if (errors[k]) {
      setErrors(prev => ({ ...prev, [k]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (form.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now just simulate add (backend implementation omitted)
      console.log('Adding product:', form);
      
      onAdded && onAdded();
      onClose();
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <svg className="modal-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" fill="currentColor"/>
            </svg>
            <h3>Add New Product</h3>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="product-name" className="form-label">
                Product Name *
              </label>
              <input
                id="product-name"
                type="text"
                value={form.name}
                onChange={(e) => change('name', e.target.value)}
                placeholder="Enter product name"
                required
                disabled={isLoading}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="product-unit" className="form-label">
                Unit
              </label>
              <select
                id="product-unit"
                value={form.unit}
                onChange={(e) => change('unit', e.target.value)}
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
            </div>

            <div className="form-group">
              <label htmlFor="product-category" className="form-label">
                Category
              </label>
              <input
                id="product-category"
                type="text"
                value={form.category}
                onChange={(e) => change('category', e.target.value)}
                placeholder="Enter category"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-brand" className="form-label">
                Brand
              </label>
              <input
                id="product-brand"
                type="text"
                value={form.brand}
                onChange={(e) => change('brand', e.target.value)}
                placeholder="Enter brand"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-stock" className="form-label">
                Stock Level
              </label>
              <input
                id="product-stock"
                type="number"
                value={form.stock}
                onChange={(e) => change('stock', Number(e.target.value))}
                min="0"
                placeholder="0"
                disabled={isLoading}
                className={errors.stock ? 'error' : ''}
              />
              {errors.stock && <span className="error-message">{errors.stock}</span>}
            </div>
          </div>

          <div className="modal-actions">
            <button 
              className="btn btn-secondary" 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                  </svg>
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}