using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MobileShop.Services;

namespace MobileShop.Controllers;

[Authorize]
public class CartController : Controller
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    public async Task<IActionResult> Index()
    {
        var cart = await _cartService.GetCartAsync(GetUserId());
        return View(cart);
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        try
        {
            await _cartService.AddToCartAsync(GetUserId(), request.ProductId, request.Quantity);
            var count = await _cartService.GetCartCountAsync(GetUserId());
            return Json(new { success = true, message = "Added to cart!", cartCount = count });
        }
        catch (InvalidOperationException ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> RemoveFromCart([FromBody] RemoveFromCartRequest request)
    {
        await _cartService.RemoveFromCartAsync(GetUserId(), request.CartItemId);
        var cart = await _cartService.GetCartAsync(GetUserId());
        return Json(new { success = true, cart });
    }

    [HttpPost]
    public async Task<IActionResult> UpdateQuantity([FromBody] UpdateQuantityRequest request)
    {
        try
        {
            await _cartService.UpdateQuantityAsync(GetUserId(), request.CartItemId, request.Quantity);
            var cart = await _cartService.GetCartAsync(GetUserId());
            return Json(new { success = true, cart });
        }
        catch (InvalidOperationException ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetCartCount()
    {
        var count = await _cartService.GetCartCountAsync(GetUserId());
        return Json(new { count });
    }
}

public class AddToCartRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class RemoveFromCartRequest
{
    public int CartItemId { get; set; }
}

public class UpdateQuantityRequest
{
    public int CartItemId { get; set; }
    public int Quantity { get; set; }
}
