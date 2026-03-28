const { getDatabase, saveDatabase } = require('../config/database');

function rowsToObjects(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

function rowToObject(result) {
  const rows = rowsToObjects(result);
  return rows.length > 0 ? rows[0] : null;
}

async function getAllProducts(filters = {}) {
  const db = await getDatabase();
  let query = 'SELECT * FROM products WHERE is_active = 1';
  const params = [];

  if (filters.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters.search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  query += ' ORDER BY created_at DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  return rowsToObjects(db.exec(query, params));
}

async function getProductById(id) {
  const db = await getDatabase();
  return rowToObject(db.exec('SELECT * FROM products WHERE id = ?', [id]));
}

async function getAllProductsAdmin() {
  const db = await getDatabase();
  return rowsToObjects(db.exec('SELECT * FROM products ORDER BY created_at DESC'));
}

async function createProduct(data) {
  const db = await getDatabase();
  db.run(
    'INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.description, parseFloat(data.price), data.category, data.image_url || '/images/placeholder.png', parseInt(data.stock)]
  );
  saveDatabase();
  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0].values[0][0];
}

async function updateProduct(id, data) {
  const db = await getDatabase();
  db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ?, is_active = ? WHERE id = ?',
    [data.name, data.description, parseFloat(data.price), data.category, data.image_url, parseInt(data.stock), data.is_active ? 1 : 0, id]
  );
  saveDatabase();
}

async function deleteProduct(id) {
  const db = await getDatabase();
  db.run('DELETE FROM products WHERE id = ?', [id]);
  saveDatabase();
}

async function getCategories() {
  const db = await getDatabase();
  const result = db.exec('SELECT DISTINCT category FROM products WHERE is_active = 1 ORDER BY category');
  if (!result || result.length === 0) return [];
  return result[0].values.map(r => r[0]);
}

async function updateStock(productId, quantity) {
  const db = await getDatabase();
  db.run('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', [quantity, productId, quantity]);
  saveDatabase();
}

module.exports = {
  getAllProducts, getProductById, getAllProductsAdmin,
  createProduct, updateProduct, deleteProduct,
  getCategories, updateStock, rowsToObjects, rowToObject
};
