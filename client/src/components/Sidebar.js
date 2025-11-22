import React from 'react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-small">
          <span className="logo-icon">E€</span>
          <span className="logo-text">Apex ERP</span>
        </div>
      </div>
      <ul className="sidebar-nav">
        <li className="active"><a href="#">Dashboard</a></li>
        <li><a href="#">Inventory</a></li>
        <li><a href="#">Sales & Invoicing</a></li>
        <li><a href="#">Human Resources</a></li>
        <li><a href="#">Reports</a></li>
        <li><a href="#">Settings</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;