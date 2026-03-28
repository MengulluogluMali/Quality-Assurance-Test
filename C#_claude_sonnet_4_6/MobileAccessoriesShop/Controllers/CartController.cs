using Microsoft.AspNetCore.Mvc;
using MobileAccessoriesShop.Services;

namespace MobileAccessoriesShop.Controllers
{
    public class CartController : Controller
    {
        private readonly CartService _cart;

        public CartController(CartService cart) => _cart = cart;

        public async Task<IActionResult> Index()
        {
            var items = await _cart.GetCartItemsAsync();
            return View(items);
        }

        [HttpPost]
        public async Task<IActionResult> Add(int productId, int quantity = 1)
        {
            await _cart.AddToCartAsync(productId, quantity);
            var count = await _cart.GetCartCountAsync();

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                return Json(new { success = true, count });

            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> Remove(int cartItemId)
        {
            await _cart.RemoveFromCartAsync(cartItemId);
            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> Update(int cartItemId, int quantity)
        {
            await _cart.UpdateQuantityAsync(cartItemId, quantity);
            var items = await _cart.GetCartItemsAsync();
            var total = items.Sum(i => i.Quantity * i.Product!.Price);
            var count = items.Sum(i => i.Quantity);
            return Json(new { success = true, total = total.ToString("F2"), count });
        }

        [HttpGet]
        public async Task<IActionResult> Count()
        {
            var count = await _cart.GetCartCountAsync();
            return Json(new { count });
        }
    }
}
