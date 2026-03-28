const nodemailer = require('nodemailer');
const webpush = require('web-push');
const { getDatabase, saveDatabase } = require('../config/database');
const { rowsToObjects } = require('./productService');

let transporter = null;
let emailAccount = null;

async function initializeEmail() {
  try {
    emailAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: emailAccount.smtp.host,
      port: emailAccount.smtp.port,
      secure: emailAccount.smtp.secure,
      auth: {
        user: emailAccount.user,
        pass: emailAccount.pass,
      },
    });
    console.log('📧 Email service initialized (Ethereal)');
    console.log(`   Preview URL: https://ethereal.email/login`);
    console.log(`   User: ${emailAccount.user}`);
    console.log(`   Pass: ${emailAccount.pass}`);
  } catch (err) {
    console.error('⚠️  Email service failed to initialize:', err.message);
  }
}

function initializePush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (publicKey && privateKey && !publicKey.includes('placeholder')) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@store.com',
      publicKey,
      privateKey
    );
    console.log('🔔 Push notification service initialized');
  } else {
    console.log('🔔 Push notifications: VAPID keys not configured (run "node generate-vapid.js" to generate)');
  }
}

async function sendEmailNotification(order, customerName) {
  if (!transporter) {
    console.log('⚠️  Email not sent - transporter not initialized');
    return;
  }

  try {
    const itemsList = order.items.map(item =>
      `  • ${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const info = await transporter.sendMail({
      from: '"MobileGear Store" <noreply@mobilegear.com>',
      to: process.env.ADMIN_EMAIL || 'admin@store.com',
      subject: `🛒 New Order #${order.id} — $${order.total.toFixed(2)}`,
      text: `New order received!\n\nOrder #${order.id}\nCustomer: ${customerName}\nTotal: $${order.total.toFixed(2)}\n\nItems:\n${itemsList}\n\nShipping to:\n${order.shipping.name}\n${order.shipping.address}\n${order.shipping.city}\nPhone: ${order.shipping.phone}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🛒 New Order Received!</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #667eea;">Order #${order.id}</h2>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Total:</strong> <span style="color: #10b981; font-size: 20px;">$${order.total.toFixed(2)}</span></p>
            <h3 style="color: #a0a0c0;">Items:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${order.items.map(item => `
                <tr style="border-bottom: 1px solid #2a2a4a;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="padding: 8px; text-align: center;">x${item.quantity}</td>
                  <td style="padding: 8px; text-align: right; color: #10b981;">$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
            <h3 style="color: #a0a0c0; margin-top: 20px;">Shipping:</h3>
            <p>${order.shipping.name}<br>${order.shipping.address}<br>${order.shipping.city}<br>📱 ${order.shipping.phone}</p>
          </div>
        </div>
      `
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`📧 Notification email sent! Preview: ${previewUrl}`);
    return previewUrl;
  } catch (err) {
    console.error('📧 Email sending failed:', err.message);
  }
}

async function sendPushNotification(order) {
  const db = await getDatabase();
  const subscriptions = rowsToObjects(db.exec(`
    SELECT ps.subscription FROM push_subscriptions ps
    JOIN users u ON ps.user_id = u.id
    WHERE u.role = 'admin'
  `));

  const payload = JSON.stringify({
    title: `🛒 New Order #${order.id}`,
    body: `$${order.total.toFixed(2)} — ${order.items.length} item(s)`,
    icon: '/images/icon-192.png',
    badge: '/images/badge-72.png',
    data: { url: '/admin' }
  });

  for (const sub of subscriptions) {
    try {
      const subscription = JSON.parse(sub.subscription);
      await webpush.sendNotification(subscription, payload);
      console.log('🔔 Push notification sent');
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired, remove it
        db.run('DELETE FROM push_subscriptions WHERE subscription = ?', [sub.subscription]);
        saveDatabase();
      }
      console.error('🔔 Push failed:', err.message);
    }
  }
}

async function savePushSubscription(userId, subscription) {
  const db = await getDatabase();
  const subStr = JSON.stringify(subscription);

  // Remove existing subscription for this user
  db.run('DELETE FROM push_subscriptions WHERE user_id = ?', [userId]);
  db.run('INSERT INTO push_subscriptions (user_id, subscription) VALUES (?, ?)', [userId, subStr]);
  saveDatabase();
}

async function removePushSubscription(userId) {
  const db = await getDatabase();
  db.run('DELETE FROM push_subscriptions WHERE user_id = ?', [userId]);
  saveDatabase();
}

async function notifyAdmin(order, customerName) {
  const emailPromise = sendEmailNotification(order, customerName);
  const pushPromise = sendPushNotification(order);
  await Promise.allSettled([emailPromise, pushPromise]);
}

module.exports = {
  initializeEmail, initializePush,
  sendEmailNotification, sendPushNotification,
  savePushSubscription, removePushSubscription,
  notifyAdmin
};
