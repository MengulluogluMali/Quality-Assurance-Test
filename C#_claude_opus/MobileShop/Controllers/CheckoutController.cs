using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MobileShop.Models.ViewModels;
using MobileShop.Services;

namespace MobileShop.Controllers;

[Authorize]
public class CheckoutController : Controller
{
    private readonly ICartService _cartService;
    private readonly IOrderService _orderService;
    private readonly INotificationService _notificationService;

    public CheckoutController(
        ICartService cartService,
        IOrderService orderService,
        INotificationService notificationService)
    {
        _cartService = cartService;
        _orderService = orderService;
        _notificationService = notificationService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    public async Task<IActionResult> Index()
    {
        var cart = await _cartService.GetCartAsync(GetUserId());
        if (!cart.Items.Any())
        {
            TempData["Warning"] = "Your cart is empty!";
            return RedirectToAction("Index", "Products");
        }

        var model = new CheckoutViewModel { Cart = cart };
        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> PlaceOrder(CheckoutViewModel model)
    {
        if (!ModelState.IsValid)
        {
            model.Cart = await _cartService.GetCartAsync(GetUserId());
            return View("Index", model);
        }

        try
        {
            var order = await _orderService.PlaceOrderAsync(GetUserId(), model);

            // Send notifications (fire and forget)
            _ = Task.Run(async () =>
            {
                try { await _notificationService.NotifyNewOrderAsync(order); }
                catch { /* logged internally */ }
            });

            return RedirectToAction(nameof(Confirmation), new { id = order.Id });
        }
        catch (InvalidOperationException ex)
        {
            TempData["Error"] = ex.Message;
            model.Cart = await _cartService.GetCartAsync(GetUserId());
            return View("Index", model);
        }
    }

    public async Task<IActionResult> Confirmation(int id)
    {
        var order = await _orderService.GetOrderAsync(id);
        if (order == null || order.UserId != GetUserId())
            return NotFound();

        return View(order);
    }
}
