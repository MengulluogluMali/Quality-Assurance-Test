const { getDatabase, saveDatabase } = require('../config/database');
const { rowsToObjects, rowToObject } = require('./productService');
const cartService = require('./cartService');

async function createOrder(userId, shippingData) {
  const db = await getDatabase();

  // Get cart items
  const cartItems = await cartService.getCartItems(userId);
  if (cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  // Calculate total
  let total = 0;
  for (const item of cartItems) {
    if (item.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }
    total += item.price * item.quantity;
  }

  try {
    db.run('BEGIN TRANSACTION');

    // Create order
    db.run(
      'INSERT INTO orders (user_id, total, status, shipping_name, shipping_address, shipping_city, shipping_phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, total, 'completed', shippingData.name, shippingData.address, shippingData.city, shippingData.phone]
    );

    const orderResult = db.exec('SELECT last_insert_rowid() as id');
    const orderId = orderResult[0].values[0][0];

    // Create order items and update stock
    for (const item of cartItems) {
      db.run(
        'INSERT INTO order_items (order_id, product_id, quantity, price, product_name) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price, item.name]
      );
      db.run(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    db.run('COMMIT');
    saveDatabase();

    return {
      id: orderId,
      total,
      items: cartItems,
      shipping: shippingData
    };
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
}

async function getOrdersByUser(userId) {
  const db = await getDatabase();
  return rowsToObjects(db.exec(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  ));
}

async function getOrderById(orderId) {
  const db = await getDatabase();
  const order = rowToObject(db.exec('SELECT * FROM orders WHERE id = ?', [orderId]));
  if (!order) return null;

  order.items = rowsToObjects(db.exec(
    'SELECT * FROM order_items WHERE order_id = ?',
    [orderId]
  ));
  return order;
}

async function getAllOrders() {
  const db = await getDatabase();
  const orders = rowsToObjects(db.exec(`
    SELECT o.*, u.name as customer_name, u.email as customer_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `));
  return orders;
}

async function getAdminStats() {
  const db = await getDatabase();

  const totalProducts = db.exec('SELECT COUNT(*) FROM products')[0].values[0][0];
  const totalOrders = db.exec('SELECT COUNT(*) FROM orders')[0].values[0][0];
  const totalRevenue = db.exec('SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = "completed"')[0].values[0][0];
  const totalCustomers = db.exec('SELECT COUNT(*) FROM users WHERE role = "customer"')[0].values[0][0];
  const recentOrders = rowsToObjects(db.exec(`
    SELECT o.*, u.name as customer_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 5
  `));

  return { totalProducts, totalOrders, totalRevenue, totalCustomers, recentOrders };
}

module.exports = { createOrder, getOrdersByUser, getOrderById, getAllOrders, getAdminStats };
