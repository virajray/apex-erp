import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Dashboard.css'; // Import the dashboard-specific CSS

const DashboardPage = ({ handleLogout }) => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header handleLogout={handleLogout} />
        <main className="content-area">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <p>Here's a snapshot of your business performance.</p>
          </div>
          
          <div className="stats-cards">
            <div className="card">
              <h3>Total Sales</h3>
              <p>Rs.12,450</p>
              <span className="card-trend positive">+5.2%</span>
            </div>
            <div className="card">
              <h3>New Customers</h3>
              <p>25</p>
              <span className="card-trend positive">+12%</span>
            </div>
            <div className="card">
              <h3>Pending Orders</h3>
              <p>8</p>
              <span className="card-trend neutral">-1</span>
            </div>
            <div className="card">
              <h3>Low Stock Items</h3>
              <p>3</p>
              <span className="card-trend negative">+2</span>
            </div>
          </div>

          <div className="dashboard-widgets">
            <div className="widget-card">
              <h3>Sales Activity</h3>
              <div className="placeholder-content">(Interactive sales chart will go here)</div>
            </div>
            <div className="widget-card">
              <h3>Recent Invoices</h3>
              <div className="placeholder-content">(List of recent invoices will go here)</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;