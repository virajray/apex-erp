// client/src/components/DashboardPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';
import './Dashboard.css';

const DashboardPage = ({ handleLogout }) => {
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [orders, setOrders] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('erp-user') || '{}');
  const isAdmin = currentUser.role === 'admin';
  const token = localStorage.getItem('erp-token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, userRes, orderRes] = await Promise.all([
          axios.get('http://localhost:5000/api/branches', { headers: { Authorization: `Bearer ${token}` } }),
          isAdmin ? axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ data: [] }),
          axios.get('http://localhost:5000/api/orders', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setBranches(branchRes.data);
        setUsers(userRes.data);
        setOrders(orderRes.data);

        if (currentUser.branchId) {
          setSelectedBranch(currentUser.branchId.toString());
        }
      } catch (err) {
        console.error('Load failed', err);
      }
    };
    fetchData();
  }, [isAdmin, currentUser.branchId, token]);

  const assignBranch = async (userId, branchId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/branch`, 
        { branchId: branchId ? parseInt(branchId) : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u => u.id === userId ? { ...u, branchId: branchId ? parseInt(branchId) : null } : u));
    } catch (err) {
      alert('Failed to assign branch');
    }
  };

  const filteredOrders = selectedBranch 
    ? orders.filter(o => o.branchId === parseInt(selectedBranch))
    : orders;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header handleLogout={handleLogout} />
        
        <main className="content-area">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <p>Branch: {currentUser.branchName || 'All Branches'}</p>
          </div>

          {/* Branch Filter */}
          <div className="branch-filter-container">
            <label>Filter by Branch: </label>
            <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="branch-select">
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="stats-cards">
            <div className="card"><h3>Total Orders</h3><p>{filteredOrders.length}</p></div>
            <div className="card"><h3>Pending</h3><p>{filteredOrders.filter(o => o.status === 'pending').length}</p></div>
            <div className="card"><h3>Completed</h3><p>{filteredOrders.filter(o => o.status === 'completed').length}</p></div>
            <div className="card"><h3>Revenue</h3><p>Rs.{filteredOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</p></div>
          </div>

          {/* Admin: Assign Branches 
          {isAdmin && (
            <div className="admin-panel">
              <h2>Assign Users to Branches</h2>
              <table className="user-branch-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Current Branch</th>
                    <th>Assign Branch</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.branchId ? branches.find(b => b.id === user.branchId)?.name || 'None' : 'All Branches'}</td>
                      <td>
                        <select 
                          value={user.branchId || ''} 
                          onChange={(e) => assignBranch(user.id, e.target.value)}
                          disabled={user.role === 'admin'}
                        >
                          <option value="">No Branch</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )} */}

          {/* Orders Table */}
          <div className="widget-card">
            <h3>Recent Orders ({filteredOrders.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fff8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Branch</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ padding: '12px' }}>{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>Rs.{order.total.toFixed(2)}</td>
                    <td><span className={`card-trend ${order.status === 'completed' ? 'positive' : 'neutral'}`}>{order.status}</span></td>
                    <td>{order.branchName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;