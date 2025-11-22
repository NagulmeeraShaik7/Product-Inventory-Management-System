import React, { useEffect, useState } from 'react';
import productsApi from '../api/products';
import './inventory-sidebar.css';

export default function InventorySidebar({ product, onClose }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!product) {
      setLogs([]);
      return;
    }
    
    let mounted = true;
    setIsLoading(true);
    
    productsApi.getProductHistory(product.id).then((data) => {
      if (!mounted) return;
      // normalize response to array
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data.logs)) list = data.logs;
      else if (Array.isArray(data.history)) list = data.history;
      else if (Array.isArray(data.data)) list = data.data;
      else list = [];
      setLogs(list);
    }).catch(() => { 
      if (mounted) setLogs([]); 
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    
    return () => { mounted = false; };
  }, [product]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!product) return null;

  return (
    <div className="sidebar-backdrop" onClick={handleBackdropClick}>
      <aside className="inventory-sidebar">
        <div className="sidebar-header">
          <div className="header-content">
            <div className="title-section">
              <svg className="sidebar-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
                <path d="M12 12H14V14H12V12ZM8 12H10V14H8V12ZM16 12H18V14H16V12Z" fill="currentColor"/>
              </svg>
              <div>
                <h3>Inventory History</h3>
                <p>Track stock changes over time</p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="product-card">
            <div className="product-header">
              <svg className="product-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11H3V9H21V11ZM21 13H3V15H21V13Z" fill="currentColor"/>
              </svg>
              <div className="product-details">
                <h4>{product.name}</h4>
                <div className="stock-badge">
                  <span className="stock-label">Current Stock</span>
                  <span className="stock-value">{product.stock}</span>
                </div>
              </div>
            </div>
            {product.brand && (
              <div className="product-meta">
                <span>Brand: {product.brand}</span>
                {product.category && <span>Category: {product.category}</span>}
              </div>
            )}
          </div>

          <div className="history-section">
            <div className="section-header">
              <h4>Stock History</h4>
              <span className="log-count">{logs.length} entries</span>
            </div>

            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading history...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="#e2e8f0"/>
                </svg>
                <p>No history available</p>
                <span>Stock changes will appear here</span>
              </div>
            ) : (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Previous</th>
                      <th>New</th>
                      <th>Difference</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => {
                      const difference = log.newStock - log.oldStock;
                      const isIncrease = difference > 0;
                      const isDecrease = difference < 0;
                      
                      return (
                        <tr key={log.id || `${log.productId}_${log.timestamp}_${index}`}>
                          <td>
                            <div className="date-cell">
                              <span className="date">{log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'N/A'}</span>
                              <span className="time">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}</span>
                            </div>
                          </td>
                          <td>
                            <span className="stock-number">{log.oldStock}</span>
                          </td>
                          <td>
                            <span className="stock-number new-stock">{log.newStock}</span>
                          </td>
                          <td>
                            <span className={`difference ${isIncrease ? 'positive' : isDecrease ? 'negative' : ''}`}>
                              {isIncrease ? '+' : ''}{difference}
                            </span>
                          </td>
                          <td>
                            <span className="user-badge">
                              {log.changedBy || 'System'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}