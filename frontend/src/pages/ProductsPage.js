import React, { useEffect, useState, useRef } from 'react';
import productsApi from '../api/products';
import ProductsHeader from '../components/ProductsHeader';
import ProductTable from '../components/ProductTable';
import InventorySidebar from '../components/InventorySidebar';
import AddProductModal from '../components/AddProductModal';
import './products-page.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const fileInputRef = useRef();

  // Fetch full product list from server and keep a master copy in `allProducts`.
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getProducts({ limit: 1000 });
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data.products)) list = data.products;
      else if (Array.isArray(data.data)) list = data.data;
      else if (Array.isArray(data.items)) list = data.items;
      else list = [];

      setAllProducts(list);
      setProducts(list);
    } catch (err) {
      console.error(err);
      alert('Failed to load products: ' + (err && err.message ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // initial load: fetch full list
  useEffect(() => { fetchProducts(); }, []);

  // Client-side filtering (name, brand, category) with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      const q = (query || '').trim().toLowerCase();
      const base = Array.isArray(allProducts) ? allProducts : [];
      const filtered = base.filter((p) => {
        const matchesCategory = category ? p.category === category : true;
        if (!q) return matchesCategory;
        const inName = (p.name || '').toLowerCase().includes(q);
        const inBrand = (p.brand || '').toLowerCase().includes(q);
        const inCategory = (p.category || '').toLowerCase().includes(q);
        return matchesCategory && (inName || inBrand || inCategory);
      });
      setProducts(filtered);
    }, 200);
    return () => clearTimeout(t);
  }, [query, category, allProducts]);

  const categories = Array.from(new Set((Array.isArray(products) ? products : []).map((p) => p.category).filter(Boolean)));

  const onImportClick = () => fileInputRef.current?.click();

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    setImportLoading(true);
    try {
      await productsApi.importProductsCsv(f);
      alert('Import successful');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Import failed: ' + (err.message || 'Please check your file format'));
    } finally {
      setImportLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await productsApi.exportProductsCsv();
      // Show success message
      console.log('Export completed successfully');
    } catch (err) {
      console.error(err);
      alert('Export failed: ' + (err.message || 'Please try again'));
    } finally {
      setExportLoading(false);
    }
  };

  const handleUpdate = (id, updated) => {
    // optimistic update
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const handleDelete = async (id) => {
    const product = products.find(p => p.id === id);
    if (!window.confirm(`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`)) return;
    
    try {
      await productsApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      // If deleted product is selected, close sidebar
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error(err);
      alert('Delete failed: ' + (err.message || 'Please try again'));
    }
  };

  const handleAddSuccess = () => {
    setShowAdd(false);
    fetchProducts();
  };

  const filtered = products.filter((p) => (category ? p.category === category : true));

  return (
    <div className="products-page">
      <ProductsHeader
        query={query}
        onQueryChange={setQuery}
        categories={categories}
        category={category}
        onCategoryChange={setCategory}
        onAdd={() => setShowAdd(true)}
        onImport={onImportClick}
        onExport={handleExport}
        importLoading={importLoading}
        exportLoading={exportLoading}
      />

      <input 
        type="file" 
        accept=".csv,.xlsx,.xls" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFile} 
      />

      <main className="products-main">
        <ProductTable
          products={filtered}
          loading={loading}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onUpdated={handleUpdate}
          onDelete={handleDelete}
        />
      </main>

      <InventorySidebar 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      <AddProductModal 
        visible={showAdd} 
        onClose={() => setShowAdd(false)} 
        onAdded={handleAddSuccess} 
      />

      {/* Loading Overlay for Import/Export */}
      {(importLoading || exportLoading) && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>{importLoading ? 'Importing products...' : 'Exporting products...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}