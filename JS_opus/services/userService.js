const bcrypt = require('bcryptjs');
const { getDatabase, saveDatabase } = require('../config/database');

async function createUser(name, email, password, role = 'customer') {
  const db = await getDatabase();
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      throw new Error('Email already exists');
    }
    throw err;
  }
}

async function authenticateUser(email, password) {
  const db = await getDatabase();
  const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const row = result[0].values[0];
  const columns = result[0].columns;
  const user = {};
  columns.forEach((col, i) => user[col] = row[i]);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  delete user.password;
  return user;
}

async function getUserById(id) {
  const db = await getDatabase();
  const result = db.exec('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);

  if (result.length === 0 || result[0].values.length === 0) return null;

  const row = result[0].values[0];
  const columns = result[0].columns;
  const user = {};
  columns.forEach((col, i) => user[col] = row[i]);
  return user;
}

module.exports = { createUser, authenticateUser, getUserById };
