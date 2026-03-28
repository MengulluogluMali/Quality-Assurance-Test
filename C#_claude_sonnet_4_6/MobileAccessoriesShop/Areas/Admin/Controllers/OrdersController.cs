using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileAccessoriesShop.Data;
using MobileAccessoriesShop.Models;
using MobileAccessoriesShop.Services;

namespace MobileAccessoriesShop.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]
    public class OrdersController : Controller
    {
        private readonly AppDbContext _db;
        private readonly EmailService _email;

        public OrdersController(AppDbContext db, EmailService email)
        {
            _db = db;
            _email = email;
        }

        public async Task<IActionResult> Index(string? status)
        {
            var query = _db.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, out var statusEnum))
                query = query.Where(o => o.Status == statusEnum);

            var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
            ViewBag.SelectedStatus = status;
            return View(orders);
        }

        public async Task<IActionResult> Details(int id)
        {
            var order = await _db.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();
            return View(order);
        }

        [HttpPost, ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateStatus(int id, OrderStatus status)
        {
            var order = await _db.Orders.Include(o => o.User).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();

            var previousStatus = order.Status;
            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            // Send shipped notification
            if (status == OrderStatus.Shipped && previousStatus != OrderStatus.Shipped && order.User != null)
            {
                _ = _email.SendOrderShippedAsync(order.User.Email!, order.User.FullName, order.Id);
            }

            TempData["Success"] = $"Order #{id} status updated to {status}.";
            return RedirectToAction(nameof(Details), new { id });
        }
    }
}
