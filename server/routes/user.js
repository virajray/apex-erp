// server/routes/user.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../index'); // Gets the db from index.js
const JWT_SECRET = 'apex-erp-secret-key-2025';

// Auth middleware (inline for simplicity)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// GET ALL USERS (Admin only)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, branchId FROM users').all();
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE USER (Admin only)
router.post('/', (req, res) => {
  console.log('=== POST /api/users called ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token');
    return res.status(401).json({ message: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);

    if (decoded.role !== 'admin') {
      console.log('Not admin');
      return res.status(403).json({ message: 'Admin only' });
    }

    const { name, email, password, role, branchId } = req.body;

    if (!name || !email || !password) {
      console.log('Missing fields');
      return res.status(400).json({ message: 'Name, email, password required' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) {
      console.log('Email exists');
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    console.log('Password hashed');

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role, branchId)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, email, hashed, role || 'staff', branchId || null);
    console.log('User inserted, ID:', result.lastInsertRowid);

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('POST /api/users ERROR:', err.stack); // ← Detailed error
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE USER (Admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { name, email, password, role, branchId } = req.body;

  try {
    let query = 'UPDATE users SET name = ?, email = ?, role = ?, branchId = ?';
    let params = [name, email, role || 'staff', branchId || null];

    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    const result = db.prepare(query).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE USER (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete own account' });
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;