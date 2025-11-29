// client/src/LoginPage.js

import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';

// Accept handleLogin from App.js (this triggers redirect + saves user data)
const LoginPage = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For better UX

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      // Send login request to backend
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Extract data from response
      const { token, user } = response.data;

      console.log('Login successful!', { token, user });

      // Save everything to localStorage so it survives page refresh
      localStorage.setItem('erp-token', token);
      localStorage.setItem('erp-user', JSON.stringify(user));

      // Pass full data to App.js → triggers redirect to dashboard
      handleLogin({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
          branchName: user.branchName || 'No Branch Assigned'
        }
      });

      // Show success message briefly before redirect
      setMessage('Login successful! Welcome back');

    } catch (error) {
      console.error('Login failed:', error);

      // Show user-friendly error
      const errorMsg = error.response?.data?.message || 'Invalid email or password';
      setMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      {/* Beautiful curved background */}
      <div className="desktop-layout">
        <div className="curve-bg"></div>
      </div>

      {/* Login Card */}
      <div className="cards-container">
        <div className="login-card">
          <div className="card-header">
            <div className="logo-small">
              <span className="logo-icon">AE</span>
              <span className="logo-text">Apex ERP</span>
            </div>
            <h3>Sign In to your account</h3>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="E-mail Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <label className="checkbox-label">
              <input type="checkbox" disabled={isLoading} />
              <span>Remember me</span>
            </label>

            <a href="#" className="forgot-link">Forgot password?</a>

            <button 
              type="submit" 
              className="sign-in-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Toast message (success or error) */}
      {message && (
        <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoginPage;