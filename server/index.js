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

app.listen(PORT, () => {
  console.log(`Apex ERP Server RUNNING on http://localhost:${PORT}`);
  console.log(`Login: admin@test.com / password123`);
});