import React, { useState } from 'react';
import './login-page.css';
import { API_ROOT } from '../api/config';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const payload = { username, password };
    const endpoints = [`${API_ROOT}/api/auth/login`, `${API_ROOT}/api/auth`];
    // Use urlencoded body to avoid CORS preflight (OPTIONS) in some environments
    const body = new URLSearchParams(payload);
    let data = null;
    
    try {
      for (const ep of endpoints) {
        const res = await fetch(ep, {
          method: 'POST',
          // omit custom Content-Type header so the browser sets
          // `application/x-www-form-urlencoded` automatically and
          // the request is a "simple" CORS request (no preflight).
          body,
        });
        if (!res.ok) continue;
        data = await res.json();
        break;
      }

      if (!data) throw new Error('Login failed');

      // Some backends wrap token under `token` and include a `status` field
      if (data.status && data.status !== 'success') throw new Error('Invalid credentials');

      const token = data.token || data.data?.token;
      if (!token) throw new Error('Token missing in response');

      localStorage.setItem('token', token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/products';
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L12 17.77L7.82 21.02L9 14.14L4 9.27L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <h1>Welcome Back</h1>
            <p>Please sign in to your account</p>
          </div>
          
          <form className="login-form" onSubmit={submit}>
            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="currentColor"/>
                </svg>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-container">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                </svg>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-container">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor"/>
                </svg>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button 
              className={`login-button ${isLoading ? 'loading' : ''}`} 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="login-footer">
              <a href="/forgot-password" className="forgot-link">Forgot password?</a>
              <p>Don't have an account? <a href="/signup" className="signup-link">Sign up</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}