using Microsoft.AspNetCore.SignalR;
using MobileShop.Models;

namespace MobileShop.Services;

public interface INotificationService
{
    Task NotifyNewOrderAsync(Order order);
}

public class NotificationService : INotificationService
{
    private readonly IHubContext<Hubs.NotificationHub> _hubContext;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IHubContext<Hubs.NotificationHub> hubContext,
        IEmailSender emailSender,
        IConfiguration configuration,
        ILogger<NotificationService> logger)
    {
        _hubContext = hubContext;
        _emailSender = emailSender;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task NotifyNewOrderAsync(Order order)
    {
        var itemCount = order.OrderItems.Count;
        var message = $"New order #{order.Id} — {itemCount} item(s) — ${order.TotalAmount:F2} from {order.FullName}";

        // Send real-time SignalR notification to admin group
        try
        {
            await _hubContext.Clients.Group("Admins").SendAsync("ReceiveOrderNotification", new
            {
                orderId = order.Id,
                message = message,
                amount = order.TotalAmount.ToString("F2"),
                customerName = order.FullName,
                itemCount = itemCount,
                timestamp = order.OrderDate.ToString("yyyy-MM-dd HH:mm:ss")
            });
            _logger.LogInformation("SignalR notification sent for order #{OrderId}", order.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SignalR notification for order #{OrderId}", order.Id);
        }

        // Send email notification to admin
        try
        {
            var adminEmail = _configuration["AdminEmail"] ?? "admin@mobileshop.com";
            var emailBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; background-color: #0a0a0f; color: #e0e0e0; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 12px; padding: 30px; border: 1px solid rgba(0,212,255,0.2);'>
                        <h1 style='color: #00d4ff; margin: 0 0 20px;'>🛒 New Order Received!</h1>
                        <div style='background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; margin-bottom: 20px;'>
                            <p style='margin: 5px 0;'><strong style='color: #00d4ff;'>Order ID:</strong> #{order.Id}</p>
                            <p style='margin: 5px 0;'><strong style='color: #00d4ff;'>Customer:</strong> {order.FullName}</p>
                            <p style='margin: 5px 0;'><strong style='color: #00d4ff;'>Items:</strong> {itemCount} item(s)</p>
                            <p style='margin: 5px 0;'><strong style='color: #00d4ff;'>Total:</strong> ${order.TotalAmount:F2}</p>
                            <p style='margin: 5px 0;'><strong style='color: #00d4ff;'>Address:</strong> {order.ShippingAddress}, {order.City} {order.ZipCode}</p>
                            <p style='margin: 5px 0;'><strong style='color: #00d4ff;'>Phone:</strong> {order.Phone}</p>
                        </div>
                        <p style='color: #888; font-size: 14px;'>Log in to your admin dashboard to manage this order.</p>
                    </div>
                </body>
                </html>";

            await _emailSender.SendEmailAsync(adminEmail, $"New Order #{order.Id} — ${order.TotalAmount:F2}", emailBody);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email notification for order #{OrderId}", order.Id);
        }
    }
}
