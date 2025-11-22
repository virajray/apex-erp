import React from 'react';

const Header = ({ handleLogout }) => {
  return (
    <header className="header">
      <div className="header-actions">
        <button className="add-new-btn">+ Add New Sale</button>
      </div>
      <div className="header-user">
        <span>Welcome, Admin!</span>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
};

export default Header;