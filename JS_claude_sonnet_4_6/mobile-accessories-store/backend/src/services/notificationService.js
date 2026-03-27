const nodemailer = require('nodemailer');

// ── Email Transport ──────────────────────────────────
function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

// ── Twilio SMS ───────────────────────────────────────
function createTwilioClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN ||
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC') === false ||
      process.env.TWILIO_ACCOUNT_SID === 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    return null;
  }
  const twilio = require('twilio');
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// ── Email Template ───────────────────────────────────
function buildEmailHtml({ orderId, user, items, total, shippingAddress }) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a3e;">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a3e;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a3e;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#16162a;border-radius:16px;overflow:hidden;border:1px solid #2a2a3e;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">📱 New Order Received!</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Mobile Accessories Store</p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <div style="background:#1e1e35;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #2a2a3e;">
            <h2 style="margin:0 0 16px;color:#a78bfa;font-size:16px;">Order #${orderId.slice(0,8).toUpperCase()}</h2>
            <p style="margin:4px 0;color:#cbd5e1;font-size:14px;"><strong style="color:#e2e8f0;">Customer:</strong> ${user.name}</p>
            <p style="margin:4px 0;color:#cbd5e1;font-size:14px;"><strong style="color:#e2e8f0;">Email:</strong> ${user.email}</p>
            ${shippingAddress ? `<p style="margin:4px 0;color:#cbd5e1;font-size:14px;"><strong style="color:#e2e8f0;">Ship to:</strong> ${shippingAddress}</p>` : ''}
            <p style="margin:4px 0;color:#cbd5e1;font-size:14px;"><strong style="color:#e2e8f0;">Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <!-- Items Table -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr style="background:#1e1e35;">
                <th style="padding:10px 12px;text-align:left;color:#a78bfa;font-size:13px;border-bottom:2px solid #2a2a3e;">Product</th>
                <th style="padding:10px 12px;text-align:center;color:#a78bfa;font-size:13px;border-bottom:2px solid #2a2a3e;">Qty</th>
                <th style="padding:10px 12px;text-align:right;color:#a78bfa;font-size:13px;border-bottom:2px solid #2a2a3e;">Subtotal</th>
              </tr>
            </thead>
            <tbody style="color:#e2e8f0;font-size:14px;">
              ${itemRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px;color:#a78bfa;font-weight:700;font-size:16px;">Total</td>
                <td style="padding:12px;color:#10b981;font-weight:700;font-size:18px;text-align:right;">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align:center;padding:20px;background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(37,99,235,0.1));border-radius:12px;border:1px solid #2a2a3e;">
            <p style="margin:0;color:#94a3b8;font-size:13px;">Login to your admin dashboard to view and manage this order.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ── Main Notification Function ───────────────────────
async function sendOrderNotification({ orderId, user, items, total, shippingAddress }) {
  const results = { email: null, sms: null };

  // ── Email ──────────────────────────────────────────
  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Mobile Accessories Store" <${process.env.SMTP_USER}>`,
        to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER,
        subject: `🛒 New Order #${orderId.slice(0,8).toUpperCase()} — $${total.toFixed(2)}`,
        html: buildEmailHtml({ orderId, user, items, total, shippingAddress }),
      });
      console.log('✉️  Order email notification sent');
      results.email = 'sent';
    } catch (err) {
      console.error('Email notification failed:', err.message);
      results.email = 'failed';
    }
  } else {
    console.log('⚠️  Email not configured — skipping email notification');
  }

  // ── SMS ────────────────────────────────────────────
  const twilioClient = createTwilioClient();
  if (twilioClient && process.env.OWNER_PHONE_NUMBER && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const itemsSummary = items.slice(0, 3)
        .map(i => `${i.name} x${i.quantity}`)
        .join(', ');
      const moreItems = items.length > 3 ? ` +${items.length - 3} more` : '';

      await twilioClient.messages.create({
        body: `🛒 New order from ${user.name}!\nOrder #${orderId.slice(0,8).toUpperCase()}\nItems: ${itemsSummary}${moreItems}\nTotal: $${total.toFixed(2)}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.OWNER_PHONE_NUMBER,
      });
      console.log('📱 SMS notification sent');
      results.sms = 'sent';
    } catch (err) {
      console.error('SMS notification failed:', err.message);
      results.sms = 'failed';
    }
  } else {
    console.log('⚠️  Twilio not configured — skipping SMS notification');
  }

  return results;
}

module.exports = { sendOrderNotification };
