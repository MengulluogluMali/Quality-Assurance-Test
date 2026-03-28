const { getDatabase, saveDatabase } = require('../config/database');
const { rowsToObjects } = require('./productService');

async function getCartItems(userId) {
  const db = await getDatabase();
  const result = db.exec(`
    SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image_url, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.id DESC
  `, [userId]);
  return rowsToObjects(result);
}

async function addToCart(userId, productId, quantity = 1) {
  const db = await getDatabase();

  // Check if product exists and has stock
  const product = db.exec('SELECT stock FROM products WHERE id = ? AND is_active = 1', [productId]);
  if (!product.length || product[0].values[0][0] < quantity) {
    throw new Error('Product not available or insufficient stock');
  }

  // Check if already in cart
  const existing = db.exec('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);

  if (existing.length && existing[0].values.length) {
    const newQty = existing[0].values[0][1] + quantity;
    db.run('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [newQty, userId, productId]);
  } else {
    db.run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity]);
  }
  saveDatabase();
}

async function updateCartItem(userId, productId, quantity) {
  const db = await getDatabase();
  if (quantity <= 0) {
    db.run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
  } else {
    db.run('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [quantity, userId, productId]);
  }
  saveDatabase();
}

async function removeFromCart(userId, productId) {
  const db = await getDatabase();
  db.run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
  saveDatabase();
}

async function getCartCount(userId) {
  const db = await getDatabase();
  const result = db.exec('SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE user_id = ?', [userId]);
  return result.length ? result[0].values[0][0] : 0;
}

async function clearCart(userId) {
  const db = await getDatabase();
  db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  saveDatabase();
}

module.exports = { getCartItems, addToCart, updateCartItem, removeFromCart, getCartCount, clearCart };
