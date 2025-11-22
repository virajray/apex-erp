// client/src/LoginPage.js
import React, { useState } from 'react'; // Import React and the useState hook
import axios from 'axios'; // Import axios
import './LoginPage.css'; // Import our new CSS file

const LoginPage = () => {
  // Create state variables to hold the email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 
  // Create a state variable to show messages to the user (e.g., login failed)
  const [message, setMessage] = useState('');

  // This function will be called when the user clicks the "Login" button
  const handleSubmit = async (event) => {
    // Prevent the default form submission behavior, which reloads the page
    event.preventDefault();
    try {
      // Send a POST request to our backend's (soon-to-be-created) login endpoint
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: email,
        password: password,
      });
      // If the login is successful, the backend will send back a token
      console.log('Login successful!', response.data);
      setMessage(`Welcome! Your token is: ${response.data.token}`);
      // In a real app, you would save this token and redirect the user
      // For now, we'll just display a success message.
    } catch (error) {
      // If the backend returns an error (e.g., wrong password), it will be caught here
      console.error('Login error!', error);
      // Set an error message to display to the user
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="app-wrapper">
      {/* Desktop: Curved white background with welcome text */}
      <div className="desktop-layout">
        <div className="curve-bg"></div>
        
        <div className="welcome-area">
            {/*
          <div className="logo">
            <span className="logo-icon">E€</span>
            <span className="logo-text">EasyPay</span>
            
          </div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          */}
        </div>
      </div>

      {/* Main Login Card (centered & only one card now) */}
      <div className="cards-container">
        <div className="login-card">
          <div className="card-header">
            <div className="logo-small">
              <span className="logo-icon">E€</span>
              <span className="logo-text">Apex ERP</span>
            </div>
            <h3>Sign In to your account</h3>
          </div>

          {/* Your original login form – fully functional */}
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="E-mail Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state on change
              required
            />
            <input
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update password state on change
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

      {/* Display the success or error message here */}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default LoginPage;