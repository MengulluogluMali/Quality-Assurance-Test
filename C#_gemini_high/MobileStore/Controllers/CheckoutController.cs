using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileStore.Data;
using MobileStore.Models;
using MobileStore.Services;

namespace MobileStore.Controllers;

[Authorize]
public class CheckoutController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IEmailService _emailService;

    public CheckoutController(ApplicationDbContext context, UserManager<IdentityUser> userManager, IEmailService emailService)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
    }

    public async Task<IActionResult> Index()
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Challenge();

        var cartItems = await _context.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .ToListAsync();

        if (!cartItems.Any()) return RedirectToAction("Index", "Cart");
        
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> ProcessCheckout(string shippingAddress)
    {
        if (string.IsNullOrWhiteSpace(shippingAddress))
        {
            ModelState.AddModelError("", "Shipping address is required.");
            return View("Index");
        }

        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Challenge();
        
        var userId = user.Id;

        var cartItems = await _context.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .ToListAsync();

        if (!cartItems.Any()) return RedirectToAction("Index", "Cart");

        decimal total = cartItems.Sum(c => c.Quantity * c.Product.Price);

        var order = new Order
        {
            UserId = userId,
            OrderDate = DateTime.Now,
            ShippingAddress = shippingAddress,
            TotalAmount = total,
            Status = "Completed"
        };

        _context.Orders.Add(order);

        foreach (var item in cartItems)
        {
            _context.OrderItems.Add(new OrderItem
            {
                Order = order,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.Product.Price
            });
            // Reduce stock
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product != null)
            {
                product.Stock -= item.Quantity;
                _context.Update(product);
            }
        }

        // Clear Cart
        _context.CartItems.RemoveRange(cartItems);
        
        await _context.SaveChangesAsync();

        // Send Email using Mock Service
        string emailMessage = $"A new order (#{order.Id}) has been placed by {user.Email} for {total:C}.\nShipping Address: {shippingAddress}";
        await _emailService.SendOrderConfirmationAsync("admin@store.com", $"New Order #{order.Id} Received", emailMessage);

        return RedirectToAction(nameof(Success), new { orderId = order.Id });
    }

    public IActionResult Success(int orderId)
    {
        ViewBag.OrderId = orderId;
        return View();
    }
}
