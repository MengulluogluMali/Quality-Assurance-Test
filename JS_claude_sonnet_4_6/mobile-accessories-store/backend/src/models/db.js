const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/store.db');

// Singleton connection
let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const db = getDb();

  // ── Users ────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'customer',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── Products ─────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT NOT NULL,
      price       REAL NOT NULL,
      stock       INTEGER NOT NULL DEFAULT 0,
      category    TEXT NOT NULL,
      image_url   TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── Cart Items ───────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity    INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── Orders ───────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id                  TEXT PRIMARY KEY,
      user_id             TEXT NOT NULL REFERENCES users(id),
      total               REAL NOT NULL,
      status              TEXT NOT NULL DEFAULT 'pending',
      stripe_payment_id   TEXT,
      shipping_address    TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── Order Items ──────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id                TEXT PRIMARY KEY,
      order_id          TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id        TEXT NOT NULL,
      product_name      TEXT NOT NULL,
      quantity          INTEGER NOT NULL,
      price_at_purchase REAL NOT NULL
    );
  `);

  // ── Seed: Admin User ─────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mystore.com';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

  if (!existing) {
    const { v4: uuidv4 } = require('uuid');
    const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    db.prepare(`
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, 'admin')
    `).run(uuidv4(), process.env.ADMIN_NAME || 'Store Admin', adminEmail, hashed);
    console.log(`✅ Admin account created: ${adminEmail}`);
  }

  // ── Seed: Sample Products ────────────────────────────
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCount.count === 0) {
    const { v4: uuidv4 } = require('uuid');
    const sampleProducts = [
      {
        name: 'MagSafe Wireless Charger 15W',
        description: 'Ultra-fast 15W magnetic wireless charger compatible with iPhone 12 and later. Features LED ring indicator and non-slip base.',
        price: 29.99,
        stock: 50,
        category: 'Chargers',
        image_url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&q=80',
      },
      {
        name: 'Premium Leather Phone Case — iPhone 15 Pro',
        description: 'Full-grain Italian leather case with card slot and MagSafe compatibility. Available in Midnight Black.',
        price: 49.99,
        stock: 30,
        category: 'Cases',
        image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80',
      },
      {
        name: 'AirPods Pro 2 Silicone Case',
        description: 'Slim protective silicone case for AirPods Pro 2nd generation. Scratch-resistant with carabiner loop.',
        price: 14.99,
        stock: 100,
        category: 'Cases',
        image_url: 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=600&q=80',
      },
      {
        name: 'Braided USB-C to Lightning Cable 2m',
        description: 'Military-grade braided cable for ultimate durability. 60W fast charging, tangle-free design.',
        price: 19.99,
        stock: 75,
        category: 'Cables',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      },
      {
        name: 'Tempered Glass Screen Protector — Samsung S24',
        description: '9H hardness tempered glass with oleophobic coating. Ultra-clear with case-friendly edges.',
        price: 12.99,
        stock: 120,
        category: 'Screen Protectors',
        image_url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80',
      },
      {
        name: 'Portable Power Bank 20000mAh',
        description: '20000mAh ultra-capacity power bank with 65W USB-C PD. Charge laptop, phone, and tablet simultaneously.',
        price: 59.99,
        stock: 25,
        category: 'Chargers',
        image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80',
      },
      {
        name: 'Ring Light Phone Holder Stand',
        description: '10" LED ring light with adjustable phone holder. 3 color modes, 10 brightness levels. Perfect for content creation.',
        price: 34.99,
        stock: 40,
        category: 'Accessories',
        image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80',
      },
      {
        name: 'Car Phone Mount — Magnetic Dashboard',
        description: 'Strong N52 magnet car mount compatible with all phones. One-hand operation, 360° rotation.',
        price: 22.99,
        stock: 60,
        category: 'Accessories',
        image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80',
      },
    ];

    const insert = db.prepare(`
      INSERT INTO products (id, name, description, price, stock, category, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of sampleProducts) {
      insert.run(uuidv4(), p.name, p.description, p.price, p.stock, p.category, p.image_url);
    }
    console.log(`✅ Seeded ${sampleProducts.length} sample products`);
  }

  console.log('✅ Database initialized');
}

module.exports = { getDb, initializeDatabase };
