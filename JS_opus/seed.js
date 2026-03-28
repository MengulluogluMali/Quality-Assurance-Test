require('dotenv').config();
const { getDatabase, saveDatabase } = require('./config/database');
const bcrypt = require('bcryptjs');

const PRODUCTS = [
  {
    name: 'Premium Silicone Case',
    description: 'Ultra-soft silicone case with microfiber lining. Provides excellent grip and all-around protection for your device. Available in multiple vibrant colors.',
    price: 24.99,
    category: 'Cases',
    image_url: '/images/products/silicone-case.webp',
    stock: 150
  },
  {
    name: 'Crystal Clear Hard Case',
    description: 'Show off your phone\'s design with this crystal-clear polycarbonate case. Anti-yellowing technology keeps it looking new. Slim profile with raised edges.',
    price: 19.99,
    category: 'Cases',
    image_url: '/images/products/clear-case.webp',
    stock: 200
  },
  {
    name: 'Leather Wallet Case',
    description: 'Genuine leather folio case with card slots and a magnetic closure. Doubles as a stand for hands-free viewing. Premium craftsmanship.',
    price: 39.99,
    category: 'Cases',
    image_url: '/images/products/leather-case.webp',
    stock: 75
  },
  {
    name: '65W GaN Fast Charger',
    description: 'Ultra-compact GaN charger with USB-C Power Delivery. Charges your phone to 50% in just 20 minutes. Compatible with laptops and tablets too.',
    price: 34.99,
    category: 'Chargers',
    image_url: '/images/products/gan-charger.webp',
    stock: 120
  },
  {
    name: 'MagSafe Wireless Charger',
    description: 'Magnetic wireless charging pad with perfect alignment every time. 15W fast charging with LED indicator. Sleek minimalist design.',
    price: 29.99,
    category: 'Chargers',
    image_url: '/images/products/wireless-charger.webp',
    stock: 90
  },
  {
    name: 'Tempered Glass Screen Protector',
    description: '9H hardness tempered glass with oleophobic coating. Edge-to-edge protection with precision cutouts. Includes easy-install alignment frame.',
    price: 12.99,
    category: 'Screen Protectors',
    image_url: '/images/products/screen-protector.webp',
    stock: 300
  },
  {
    name: 'Privacy Screen Protector',
    description: 'Anti-spy tempered glass that limits viewing angles to 30°. Keep your screen content private in public. Full coverage with smooth touch feel.',
    price: 16.99,
    category: 'Screen Protectors',
    image_url: '/images/products/privacy-screen.webp',
    stock: 85
  },
  {
    name: 'Pro Active Noise Cancelling Earbuds',
    description: 'Hybrid ANC with transparency mode. 30-hour battery life with case. Hi-Res Audio certified with LDAC support. IPX5 water resistant.',
    price: 79.99,
    category: 'Earbuds',
    image_url: '/images/products/anc-earbuds.webp',
    stock: 60
  },
  {
    name: 'Sport Wireless Earbuds',
    description: 'Secure-fit ear hooks for intense workouts. IPX7 waterproof rating. 8-hour battery with quick charge. Deep bass with clear vocal reproduction.',
    price: 49.99,
    category: 'Earbuds',
    image_url: '/images/products/sport-earbuds.webp',
    stock: 45
  },
  {
    name: 'Braided USB-C to USB-C Cable (6ft)',
    description: 'Premium nylon-braided cable rated for 100W PD charging. 480Mbps data transfer. Reinforced connectors with 15,000+ bend lifespan.',
    price: 14.99,
    category: 'Cables',
    image_url: '/images/products/usbc-cable.webp',
    stock: 250
  },
  {
    name: 'Adjustable Phone Stand',
    description: 'Aluminum alloy stand with 270° adjustable viewing angle. Anti-slip silicone pads protect your device. Perfect for video calls and streaming.',
    price: 19.99,
    category: 'Stands',
    image_url: '/images/products/phone-stand.webp',
    stock: 100
  },
  {
    name: '10000mAh Slim Power Bank',
    description: 'Ultra-slim portable charger with dual USB-C ports. 22.5W fast charging output. LED battery indicator. Fits easily in your pocket.',
    price: 29.99,
    category: 'Power Banks',
    image_url: '/images/products/power-bank.webp',
    stock: 80
  }
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  const db = await getDatabase();

  // Clear existing data
  db.run('DELETE FROM order_items');
  db.run('DELETE FROM orders');
  db.run('DELETE FROM cart_items');
  db.run('DELETE FROM push_subscriptions');
  db.run('DELETE FROM products');
  db.run('DELETE FROM users');

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  db.run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Store Admin', 'admin@store.com', adminHash, 'admin']
  );
  console.log('✅ Admin user created: admin@store.com / admin123');

  // Create customer user
  const customerHash = await bcrypt.hash('customer123', 12);
  db.run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Jane Customer', 'customer@test.com', customerHash, 'customer']
  );
  console.log('✅ Customer user created: customer@test.com / customer123');

  // Create products
  for (const product of PRODUCTS) {
    db.run(
      'INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
      [product.name, product.description, product.price, product.category, product.image_url, product.stock]
    );
    console.log(`  📦 Added: ${product.name} — $${product.price}`);
  }

  saveDatabase();
  console.log(`\n✅ Seeded ${PRODUCTS.length} products successfully!`);
  console.log('\n🚀 Run "npm start" to launch the store.\n');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
