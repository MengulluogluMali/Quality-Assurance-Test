using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileAccessoriesShop.Data;
using MobileAccessoriesShop.Models;
using MobileAccessoriesShop.Services;

namespace MobileAccessoriesShop.Controllers
{
    [Authorize]
    public class CheckoutController : Controller
    {
        private readonly AppDbContext _db;
        private readonly CartService _cart;
        private readonly EmailService _email;
        private readonly PushNotificationService _push;
        private readonly StripeSettings _stripe;
        private readonly UserManager<ApplicationUser> _userManager;

        public CheckoutController(
            AppDbContext db,
            CartService cart,
            EmailService email,
            PushNotificationService push,
            StripeSettings stripe,
            UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _cart = cart;
            _email = email;
            _push = push;
            _stripe = stripe;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var items = await _cart.GetCartItemsAsync();
            if (!items.Any()) return RedirectToAction("Index", "Cart");

            ViewBag.CartItems = items;
            ViewBag.Total = items.Sum(i => i.Quantity * i.Product!.Price);
            ViewBag.StripePublishableKey = _stripe.PublishableKey;

            var user = await _userManager.GetUserAsync(User);
            ViewBag.User = user;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> PlaceOrder(
            string fullName, string address, string city,
            string postalCode, string country, string? notes,
            string? paymentIntentId)
        {
            var user = await _userManager.GetUserAsync(User);
            var items = await _cart.GetCartItemsAsync();

            if (!items.Any())
                return RedirectToAction("Index", "Cart");

            var total = items.Sum(i => i.Quantity * i.Product!.Price);

            var order = new Order
            {
                UserId = user!.Id,
                ShippingFullName = fullName,
                ShippingAddress = address,
                ShippingCity = city,
                ShippingPostalCode = postalCode,
                ShippingCountry = country,
                Notes = notes,
                TotalAmount = total,
                Status = OrderStatus.Paid,
                StripePaymentIntentId = paymentIntentId,
                Items = items.Select(i => new OrderItem
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity,
                    UnitPrice = i.Product!.Price
                }).ToList()
            };

            _db.Orders.Add(order);

            // Reduce stock
            foreach (var item in items)
            {
                var product = await _db.Products.FindAsync(item.ProductId);
                if (product != null)
                    product.StockQuantity = Math.Max(0, product.StockQuantity - item.Quantity);
            }

            await _db.SaveChangesAsync();
            await _cart.ClearCartAsync();

            // Fire notifications (non-blocking)
            _ = Task.Run(async () =>
            {
                await _email.SendOrderConfirmationAsync(user.Email!, user.FullName, order.Id, total);
                await _email.SendOwnerNotificationAsync(user.FullName, order.Id, total);
                await _push.SendToAllAdminsAsync(
                    "🛒 New Order!",
                    $"Order #{order.Id} — ${total:F2} by {user.FullName}",
                    $"/Admin/Orders/Details/{order.Id}");
            });

            return RedirectToAction("Confirmation", new { id = order.Id });
        }

        public async Task<IActionResult> Confirmation(int id)
        {
            var userId = _userManager.GetUserId(User);
            var order = await _db.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null) return NotFound();
            return View(order);
        }
    }
}
