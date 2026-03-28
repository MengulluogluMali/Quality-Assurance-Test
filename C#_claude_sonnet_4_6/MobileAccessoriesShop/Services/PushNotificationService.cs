using MobileAccessoriesShop.Data;
using Microsoft.EntityFrameworkCore;
using WebPush;
using System.Text.Json;
using ModelPushSub = MobileAccessoriesShop.Models.PushSubscription;

namespace MobileAccessoriesShop.Services
{
    public class VapidSettings
    {
        public string PublicKey { get; set; } = string.Empty;
        public string PrivateKey { get; set; } = string.Empty;
        public string Subject { get; set; } = "mailto:admin@mobileshop.com";
    }

    public class PushNotificationService
    {
        private readonly AppDbContext _db;
        private readonly VapidSettings _vapid;
        private readonly ILogger<PushNotificationService> _logger;

        public PushNotificationService(AppDbContext db, VapidSettings vapid, ILogger<PushNotificationService> logger)
        {
            _db = db;
            _vapid = vapid;
            _logger = logger;
        }

        public async Task SendToAllAdminsAsync(string title, string body, string? url = null)
        {
            if (string.IsNullOrEmpty(_vapid.PublicKey) || string.IsNullOrEmpty(_vapid.PrivateKey))
            {
                _logger.LogWarning("VAPID keys not configured — skipping push notifications");
                return;
            }

            var adminSubs = await _db.PushSubscriptions.ToListAsync();
            var payload = JsonSerializer.Serialize(new { title, body, url });

            foreach (var sub in adminSubs)
            {
                try
                {
                    var pushSub = new PushSubscription(sub.Endpoint, sub.P256dh, sub.Auth);
                    var vapidDetails = new VapidDetails(_vapid.Subject, _vapid.PublicKey, _vapid.PrivateKey);
                    var webPushClient = new WebPushClient();
                    await webPushClient.SendNotificationAsync(pushSub, payload, vapidDetails);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send push to {Endpoint}", sub.Endpoint);
                }
            }
        }

        public async Task SaveSubscriptionAsync(string? userId, string endpoint, string p256dh, string auth)
        {
            var existing = await _db.PushSubscriptions.FirstOrDefaultAsync(p => p.Endpoint == endpoint);
            if (existing != null) return;

            _db.PushSubscriptions.Add(new ModelPushSub
            {
                UserId = userId,
                Endpoint = endpoint,
                P256dh = p256dh,
                Auth = auth
            });
            await _db.SaveChangesAsync();
        }

        public async Task RemoveSubscriptionAsync(string endpoint)
        {
            var sub = await _db.PushSubscriptions.FirstOrDefaultAsync(p => p.Endpoint == endpoint);
            if (sub != null)
            {
                _db.PushSubscriptions.Remove(sub);
                await _db.SaveChangesAsync();
            }
        }
    }
}
