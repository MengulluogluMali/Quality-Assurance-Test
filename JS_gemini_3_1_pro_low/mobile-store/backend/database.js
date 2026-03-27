const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'store.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user'
            )
        `);

        // Products table
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                image TEXT,
                category TEXT
            )
        `);

        // Orders table
        db.run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                total_amount REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        // Insert initial mock data if empty
        db.get('SELECT COUNT(*) AS count FROM products', (err, row) => {
            if (row && row.count === 0) {
                const stmt = db.prepare('INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)');
                stmt.run('Elite Phone Case', 'Premium protective case with MagSafe compatibility', 29.99, 'https://picsum.photos/400/400?random=1', 'Cases');
                stmt.run('Fast Charger 30W', 'Ultra-fast GaN charger for modern smartphones', 19.99, 'https://picsum.photos/400/400?random=2', 'Chargers');
                stmt.run('Glass Screen Protector', 'Tempered glass, 9H hardness, easy install', 14.99, 'https://picsum.photos/400/400?random=3', 'Protection');
                stmt.run('Wireless Earbuds', 'Noise cancelling bluetooth earbuds with long battery life', 89.99, 'https://picsum.photos/400/400?random=4', 'Audio');
                stmt.finalize();
                console.log('Mock products inserted.');
            }
        });
    });
}

module.exports = db;
