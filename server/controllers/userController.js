// server/controllers/userController.js — SQLite VERSION (no Mongoose)

const bcrypt = require('bcryptjs');
const db = require('../index'); // This gets the db instance from index.js

// CREATE USER
exports.registerUser = (req, res) => {
  const { name, email, password, role, branchId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    // Check if email exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
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
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET ALL USERS
exports.getUsers = (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, branchId FROM users').all();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE USER
exports.updateUser = (req, res) => {
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

    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE USER
exports.deleteUser = (req, res) => {
  try {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};