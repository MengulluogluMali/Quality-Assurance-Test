const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up Nodemailer with Ethereal mock server for testing
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return;
    }
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
});

// GET all products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET single product
app.get('/api/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// Simple Mock Auth (Register)
app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], function(err) {
        if (err) return res.status(400).json({ error: 'User already exists or bad request' });
        res.status(201).json({ id: this.lastID, email, message: 'User created' });
    });
});

// Simple Mock Auth (Login)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Invalid credentials' });
        res.json({ id: row.id, email: row.email, token: 'mock-jwt-token' });
    });
});

// Checkout Mock endpoint
app.post('/api/checkout', async (req, res) => {
    const { items, total, email } = req.body;
    
    // In a real app we'd integrate Stripe here. For now, simulate success.
    
    // Send email notification using Mock SMTP
    try {
        const mailOptions = {
            from: '"Mobile Store" <no-reply@mobilestore.example.com>',
            to: email, // or admin email
            subject: 'Order Confirmation - Mobile Store',
            text: `You have successfully purchased items totaling $${total}.\n\nOrder Details:\n${items.map(i => i.name).join(', ')}`,
            html: `<p>You have successfully purchased items totaling <b>$${total}</b>.</p><p>Order Details:</p><ul>${items.map(i => `<li>${i.name}</li>`).join('')}</ul>`
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        
        res.json({ 
            success: true, 
            message: 'Order successful, notification triggered.',
            emailPreviewUrl: nodemailer.getTestMessageUrl(info)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to complete checkout process', details: err.message });
    }
});

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
