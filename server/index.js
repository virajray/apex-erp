// server/index.js — FULLY WORKING (Node.js 24 + SQLite)

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'apex-erp-secret-key-2025';

const db = new Database('apex-erp.db');

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Create tables
db.exec(`CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  code TEXT UNIQUE
)`);

db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'staff',
  branchId INTEGER
)`);

db.exec(`CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderNumber TEXT UNIQUE,
  customerName TEXT,
  total REAL,
  status TEXT DEFAULT 'pending',
  branchId INTEGER
)`);

// Seed demo data
db.exec(`
  INSERT OR IGNORE INTO branches (name, code) VALUES 
  ('Downtown', 'BR001'), 
  ('Uptown', 'BR002'),
  ('Northside', 'BR003');
`);

db.exec(`
  INSERT OR IGNORE INTO users (name, email, password, role, branchId) VALUES
  ('Admin', 'admin@test.com', '${bcrypt.hashSync('password123', 10)}', 'admin', NULL),
  ('John', 'john@test.com', '${bcrypt.hashSync('password123', 10)}', 'staff', 1),
  ('Sarah', 'sarah@test.com', '${bcrypt.hashSync('password123', 10)}', 'staff', 2),
  ('Mike', 'mike@test.com', '${bcrypt.hashSync('password123', 10)}', 'manager', 3);
`);

db.exec(`
  INSERT OR IGNORE INTO orders (orderNumber, customerName, total, status, branchId) VALUES
  ('ORD001', 'Alice', 250, 'completed', 1),
  ('ORD002', 'Bob', 180, 'pending', 1),
  ('ORD003', 'Charlie', 320, 'completed', 2),
  ('ORD004', 'Diana', 450, 'completed', 3);
`);

app.use(cors());
app.use(express.json());

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const branchName = user.branchId 
    ? db.prepare('SELECT name FROM branches WHERE id = ?').get(user.branchId)?.name 
    : 'All Branches';

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role, branchId: user.branchId },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      branchName
    }
  });
});

// GET BRANCHES
app.get('/api/branches', (req, res) => {
  const branches = db.prepare('SELECT * FROM branches').all();
  res.json(branches);
});

// GET USERS (Admin only)
app.get('/api/users', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const users = db.prepare('SELECT id, name, email, role, branchId FROM users').all();
    res.json(users);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// UPDATE USER BRANCH (Admin only)
app.put('/api/users/:id/branch', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const { branchId } = req.body;
    db.prepare('UPDATE users SET branchId = ? WHERE id = ?').run(branchId || null, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// GET ORDERS (branch-restricted)
app.get('/api/orders', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { role, branchId } = decoded;

    let orders;
    if (role === 'admin') {
      orders = db.prepare(`
        SELECT o.*, b.name as branchName 
        FROM orders o 
        JOIN branches b ON o.branchId = b.id
      `).all();
    } else {
      orders = db.prepare(`
        SELECT o.*, b.name as branchName 
        FROM orders o 
        JOIN branches b ON o.branchId = b.id 
        WHERE o.branchId = ?
      `).all(branchId);
    }

    res.json(orders);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// CREATE BRANCH
app.post('/api/branches', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    const { name, code } = req.body;
    db.prepare('INSERT INTO branches (name, code) VALUES (?, ?)').run(name, code);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: 'Failed' });
  }
});

// DELETE BRANCH
app.delete('/api/branches/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    db.prepare('DELETE FROM branches WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: 'Cannot delete: has users/orders' });
  }
});

// USER ROUTES
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

// USER MANAGEMENT ROUTES (Admin only)

// GET ALL USERS
app.get('/api/users', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const users = db.prepare('SELECT id, name, email, role, branchId FROM users').all();
    res.json(users);
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// CREATE NEW USER
app.post('/api/users', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const { name, email, password, role, branchId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role, branchId)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, email, hashedPassword, role || 'staff', branchId || null);

    res.status(201).json({ 
      success: true, 
      id: result.lastInsertRowid,
      message: 'User created successfully'
    });
  } catch (err) {
    console.error('POST /api/users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE USER
app.put('/api/users/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const { name, email, password, role, branchId } = req.body;

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

    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    console.error('PUT /api/users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE USER
app.delete('/api/users/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('DELETE /api/users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Apex ERP Server RUNNING on http://localhost:${PORT}`);
  console.log(`Login: admin@test.com / password123`);
});