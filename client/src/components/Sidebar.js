// client/src/components/Sidebar.js

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Orders', path: '/orders' },
    { name: 'Branches', path: '/branches' },   // ← NEW
    { name: 'Users', path: '/users' },
    { name: 'Reports', path: '/reports' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-small">
          <span className="logo-icon">AE</span>
          <span className="logo-text">Apex ERP</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
              <Link to={item.path}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;