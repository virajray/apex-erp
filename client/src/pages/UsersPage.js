// client/src/pages/UsersPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/Dashboard.css';

const UsersPage = ({ handleLogout }) => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier', // default role
    branchId: ''
  });
  const [editingUser, setEditingUser] = useState(null);

  const token = localStorage.getItem('erp-token');
  const currentUser = JSON.parse(localStorage.getItem('erp-user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      alert('Access denied: Admins only');
      window.location.href = '/dashboard';
      return;
    }

    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [userRes, branchRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/branches', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setUsers(userRes.data);
      setBranches(branchRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load data');
    }
  };

  const handleSaveUser = async () => {
    if (!newUser.name || !newUser.email || (!editingUser && !newUser.password)) {
      return alert('Please fill all required fields');
    }

    try {
      if (editingUser) {
        // Update user (password optional)
        await axios.put(`http://localhost:5000/api/users/${editingUser.id}`, {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          branchId: newUser.branchId ? parseInt(newUser.branchId) : null,
          password: newUser.password || undefined // only send if provided
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('User updated successfully');
      } else {
        // Create new user
        await axios.post('http://localhost:5000/api/users', {
          ...newUser,
          branchId: newUser.branchId ? parseInt(newUser.branchId) : null
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('User created successfully');
      }

      // Reset form
      setNewUser({ name: '', email: '', password: '', role: 'cashier', branchId: '' });
      setEditingUser(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      branchId: user.branchId || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      alert('User deleted');
    } catch (err) {
      alert('Cannot delete user: may have sales records');
    }
  };

  const getBranchName = (branchId) => {
    if (!branchId) return 'All Branches';
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Unknown';
  };

  return (
    <main className="content-area">
      <div className="dashboard-header">
        <h1>User Management</h1>
        <p>Add, edit, and manage system users and their roles</p>
      </div>

      {/* Add / Edit User */}
      <div className="admin-panel">
        <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <input
            placeholder="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00' }}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00' }}
          />
          <input
            type="password"
            placeholder={editingUser ? 'New Password (optional)' : 'Password'}
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00' }}
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00' }}
          >
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={newUser.branchId}
            onChange={(e) => setNewUser({ ...newUser, branchId: e.target.value })}
            style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00' }}
          >
            <option value="">All Branches (Admin/Manager)</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {editingUser && (
            <button
              onClick={() => {
                setEditingUser(null);
                setNewUser({ name: '', email: '', password: '', role: 'cashier', branchId: '' });
              }}
              style={{ padding: '12px 24px', background: '#eee', border: 'none', borderRadius: '12px' }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSaveUser}
            className="add-new-btn"
            style={{ padding: '12px 30px' }}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="widget-card">
        <h2>All Users ({users.length})</h2>

        {users.length === 0 ? (
          <p style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            No users yet. Create the first one above.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fff8f0' }}>
                <th style={{ padding: '16px', textAlign: 'left' }}>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: '16px' }}><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: user.role === 'admin' ? '#ff8c00' : user.role === 'manager' ? '#ffa000' : '#e8f5e9',
                      color: user.role === 'admin' || user.role === 'manager' ? 'white' : '#2e7d32'
                    }}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{getBranchName(user.branchId)}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(user)}
                      style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
};

export default UsersPage;