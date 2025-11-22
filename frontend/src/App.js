import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/products"
          element={token ? <ProductsPage /> : <Navigate to="/login" replace />}
        />
        <Route path="/" element={<Navigate to={token ? '/products' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
