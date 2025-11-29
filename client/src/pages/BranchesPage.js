// client/src/pages/BranchesPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../components/Dashboard.css';

const BranchesPage = ({ handleLogout }) => {
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [newBranch, setNewBranch] = useState({ name: '', code: '' });
  const token = localStorage.getItem('erp-token');

  const currentUser = JSON.parse(localStorage.getItem('erp-user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      alert('Access denied');
      window.location.href = '/dashboard';
      return;
    }

    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [branchRes, userRes] = await Promise.all([
        axios.get('http://localhost:5000/api/branches', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBranches(branchRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createBranch = async () => {
    if (!newBranch.name || !newBranch.code) return alert('Fill all fields');

    try {
      await axios.post('http://localhost:5000/api/branches', newBranch, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewBranch({ name: '', code: '' });
      fetchData();
    } catch (err) {
      alert('Failed to create branch');
    }
  };

  const deleteBranch = async (id) => {
    if (!window.confirm('Delete this branch? Users will lose access.')) return;

    try {
      await axios.delete(`http://localhost:5000/api/branches/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Cannot delete: branch has users or orders');
    }
  };

  const assignBranch = async (userId, branchId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/branch`, 
        { branchId: branchId ? parseInt(branchId) : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u => u.id === userId ? { ...u, branchId: branchId ? parseInt(branchId) : null } : u));
    } catch (err) {
      alert('Failed');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header handleLogout={handleLogout} />
        
        <main className="content-area">
          <div className="dashboard-header">
            <h1>Branch Management</h1>
            <p>Manage all store locations and user assignments</p>
          </div>

          {/* Create New Branch */}
          <div className="admin-panel">
            <h2>Create New Branch</h2>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <input
                placeholder="Branch Name (e.g. Downtown)"
                value={newBranch.name}
                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00', flex: 1 }}
              />
              <input
                placeholder="Code (e.g. BR004)"
                value={newBranch.code}
                onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00', width: '150px' }}
              />
              <button onClick={createBranch} className="add-new-btn" style={{ padding: '12px 24px' }}>
                Create Branch
              </button>
            </div>
          </div>

          {/* Branches List */}
          <div className="widget-card">
            <h2>All Branches ({branches.length})</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fff8f0' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Name</th>
                  <th>Code</th>
                  <th>Users Assigned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(branch => {
                  const assignedUsers = users.filter(u => u.branchId === branch.id);
                  return (
                    <tr key={branch.id}>
                      <td style={{ padding: '16px' }}><strong>{branch.name}</strong></td>
                      <td>{branch.code}</td>
                      <td>{assignedUsers.length} users</td>
                      <td>
                        <button onClick={() => deleteBranch(branch.id)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Assign Users */}
          <div className="admin-panel">
            <h2>Assign Users to Branches</h2>
            <table className="user-branch-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Current Branch</th>
                  <th>Assign</th>
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
                      <select value={user.branchId || ''} onChange={(e) => assignBranch(user.id, e.target.value)}>
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
        </main>
      </div>
    </div>
  );
};

export default BranchesPage;