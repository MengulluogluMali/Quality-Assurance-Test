using MailKit.Net.Smtp;
using MimeKit;

namespace MobileAccessoriesShop.Services
{
    public class EmailSettings
    {
        public string SmtpHost { get; set; } = "smtp.gmail.com";
        public int SmtpPort { get; set; } = 587;
        public string SenderEmail { get; set; } = string.Empty;
        public string SenderPassword { get; set; } = string.Empty;
        public string SenderName { get; set; } = "MobileShop";
        public string OwnerEmail { get; set; } = string.Empty;
    }

    public class EmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(EmailSettings settings, ILogger<EmailService> logger)
        {
            _settings = settings;
            _logger = logger;
        }

        public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            if (string.IsNullOrWhiteSpace(_settings.SenderEmail) || string.IsNullOrWhiteSpace(_settings.SenderPassword))
            {
                _logger.LogWarning("Email not configured — skipping send to {Email}", toEmail);
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

            try
            {
                using var client = new SmtpClient();
                await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_settings.SenderEmail, _settings.SenderPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                _logger.LogInformation("Email sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            }
        }

        public async Task SendOrderConfirmationAsync(string customerEmail, string customerName, int orderId, decimal total)
        {
            var html = $@"
<!DOCTYPE html>
<html>
<body style='font-family:Inter,sans-serif;background:#0d1117;color:#e6edf3;margin:0;padding:0;'>
  <div style='max-width:600px;margin:32px auto;background:#161b22;border-radius:16px;overflow:hidden;'>
    <div style='background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px;text-align:center;'>
      <h1 style='margin:0;font-size:28px;color:#fff;'>Order Confirmed! 🎉</h1>
    </div>
    <div style='padding:32px;'>
      <p>Hi <strong>{customerName}</strong>, thank you for your purchase!</p>
      <div style='background:#0d1117;border-radius:12px;padding:20px;margin:20px 0;text-align:center;'>
        <p style='margin:0;color:#8b949e;'>Order ID</p>
        <p style='margin:8px 0;font-size:24px;font-weight:700;color:#7c3aed;'>#{orderId}</p>
        <p style='margin:0;color:#8b949e;'>Total Amount</p>
        <p style='margin:8px 0;font-size:22px;font-weight:700;color:#06b6d4;'>${total:F2}</p>
      </div>
      <p>We'll notify you as soon as your order ships.</p>
      <p style='color:#8b949e;font-size:14px;margin-top:32px;'>MobileShop — Premium Phone Accessories</p>
    </div>
  </div>
</body>
</html>";

            await SendAsync(customerEmail, customerName, $"Order #{orderId} Confirmed ✓ — MobileShop", html);
        }

        public async Task SendOwnerNotificationAsync(string customerName, int orderId, decimal total)
        {
            var html = $@"
<!DOCTYPE html>
<html>
<body style='font-family:Inter,sans-serif;background:#0d1117;color:#e6edf3;margin:0;padding:0;'>
  <div style='max-width:600px;margin:32px auto;background:#161b22;border-radius:16px;overflow:hidden;'>
    <div style='background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px;text-align:center;'>
      <h1 style='margin:0;font-size:24px;color:#fff;'>🛒 New Order Received!</h1>
    </div>
    <div style='padding:32px;'>
      <p>A new order has been placed on your store.</p>
      <div style='background:#0d1117;border-radius:12px;padding:20px;margin:20px 0;'>
        <p><strong>Customer:</strong> {customerName}</p>
        <p><strong>Order ID:</strong> #{orderId}</p>
        <p><strong>Total:</strong> ${total:F2}</p>
      </div>
      <p>Log into your admin panel to view and process this order.</p>
    </div>
  </div>
</body>
</html>";

            await SendAsync(_settings.OwnerEmail, "Shop Admin", $"🛒 New Order #{orderId} — ${total:F2}", html);
        }

        public async Task SendOrderShippedAsync(string customerEmail, string customerName, int orderId)
        {
            var html = $@"
<!DOCTYPE html>
<html>
<body style='font-family:Inter,sans-serif;background:#0d1117;color:#e6edf3;margin:0;padding:0;'>
  <div style='max-width:600px;margin:32px auto;background:#161b22;border-radius:16px;overflow:hidden;'>
    <div style='background:linear-gradient(135deg,#059669,#06b6d4);padding:32px;text-align:center;'>
      <h1 style='margin:0;font-size:28px;color:#fff;'>📦 Your Order is on the Way!</h1>
    </div>
    <div style='padding:32px;'>
      <p>Hi <strong>{customerName}</strong>, great news!</p>
      <p>Your order <strong>#{orderId}</strong> has been shipped and is on its way to you.</p>
      <p>Thank you for shopping with MobileShop!</p>
    </div>
  </div>
</body>
</html>";

            await SendAsync(customerEmail, customerName, $"Order #{orderId} Shipped 📦 — MobileShop", html);
        }
    }
}
