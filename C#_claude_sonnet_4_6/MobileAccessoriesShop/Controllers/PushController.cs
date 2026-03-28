using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MobileAccessoriesShop.Services;

namespace MobileAccessoriesShop.Controllers
{
    [Authorize]
    public class PushController : Controller
    {
        private readonly PushNotificationService _push;
        private readonly Microsoft.AspNetCore.Identity.UserManager<Models.ApplicationUser> _userManager;

        public PushController(PushNotificationService push,
            Microsoft.AspNetCore.Identity.UserManager<Models.ApplicationUser> userManager)
        {
            _push = push;
            _userManager = userManager;
        }

        [HttpPost]
        public async Task<IActionResult> Subscribe([FromBody] SubscribeRequest req)
        {
            var userId = _userManager.GetUserId(User);
            await _push.SaveSubscriptionAsync(userId, req.Endpoint, req.P256dh, req.Auth);
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribeRequest req)
        {
            await _push.RemoveSubscriptionAsync(req.Endpoint);
            return Ok();
        }
    }

    public class SubscribeRequest
    {
        public string Endpoint { get; set; } = string.Empty;
        public string P256dh { get; set; } = string.Empty;
        public string Auth { get; set; } = string.Empty;
    }

    public class UnsubscribeRequest
    {
        public string Endpoint { get; set; } = string.Empty;
    }
}
