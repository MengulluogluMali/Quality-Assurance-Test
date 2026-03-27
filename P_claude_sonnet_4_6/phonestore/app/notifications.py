from flask import current_app
from flask_mail import Message
from app import mail


def send_purchase_notification(order):
    """Send email notification to owner when a purchase is made."""
    owner_email = current_app.config.get('OWNER_EMAIL')
    if not owner_email:
        current_app.logger.warning('OWNER_EMAIL not configured — skipping notification.')
        return

    try:
        subject = f'🛒 New Order #{order.id} — ${order.total:.2f}'
        items_text = '\n'.join(
            f'  • {item.product.name} x{item.quantity} @ ${item.unit_price:.2f}'
            for item in order.items
        )
        body = f"""New order received!

Order #{order.id}
Customer: {order.user.name} ({order.user.email})
Total: ${order.total:.2f}
Status: {order.status}

Items:
{items_text}

Shipping to:
{order.shipping_name}
{order.shipping_address}
{order.shipping_city}
{order.shipping_country}

View orders at: http://localhost:5000/admin/orders
"""
        msg = Message(subject=subject, recipients=[owner_email], body=body)
        mail.send(msg)
        current_app.logger.info(f'Purchase notification sent for Order #{order.id}')
    except Exception as e:
        current_app.logger.error(f'Failed to send purchase notification: {e}')


def send_order_confirmation(order):
    """Send order confirmation email to the customer."""
    try:
        subject = f'✅ Order Confirmed — PhoneStore #{ order.id}'
        items_html = ''.join(
            f'<tr><td>{item.product.name}</td><td>{item.quantity}</td>'
            f'<td>${item.unit_price:.2f}</td><td>${item.subtotal:.2f}</td></tr>'
            for item in order.items
        )
        html_body = f"""
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0d0d0d;color:#fff;padding:30px;border-radius:12px;">
          <h1 style="color:#7C3AED;">Thank you for your order!</h1>
          <p>Hi {order.user.name}, your order <strong>#{order.id}</strong> has been confirmed.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <thead style="background:#1a1a2e;">
              <tr>
                <th style="padding:10px;text-align:left;">Product</th>
                <th style="padding:10px;">Qty</th>
                <th style="padding:10px;">Price</th>
                <th style="padding:10px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>{items_html}</tbody>
            <tfoot>
              <tr style="font-weight:bold;border-top:2px solid #7C3AED;">
                <td colspan="3" style="padding:10px;">Total</td>
                <td style="padding:10px;">${order.total:.2f}</td>
              </tr>
            </tfoot>
          </table>
          <p style="color:#aaa;">Shipping to: {order.shipping_name}, {order.shipping_address}, {order.shipping_city}</p>
          <p style="color:#666;font-size:12px;">PhoneStore — Your mobile accessories destination</p>
        </div>
        """
        msg = Message(subject=subject, recipients=[order.user.email], html=html_body)
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f'Failed to send order confirmation: {e}')
