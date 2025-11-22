// client/src/LoginPage.js

import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';

// Accept handleLogin from App.js
const LoginPage = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // SUCCESS → Tell App.js we are logged in!
      console.log('Login successful!', response.data.token);
      handleLogin(response.data.token);   // THIS LINE DOES THE REDIRECT

      // Optional: show a quick success toast (will disappear when we redirect)
      setMessage('Login successful! Redirecting...');

    } catch (error) {
      console.error('Login error!', error);
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="app-wrapper">
      <div className="desktop-layout">
        <div className="curve-bg"></div>
      </div>

      <div className="cards-container">
        <div className="login-card">
          <div className="card-header">
            <div className="logo-small">
              <span className="logo-icon">E€</span>
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
            />
            <input
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <a href="#" className="forgot-link">Forgot password?</a>

            <button type="submit" className="sign-in-btn">
              Sign In
            </button>
          </form>
        </div>
      </div>

      {/* Success / error toast */}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default LoginPage;