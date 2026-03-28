using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileAccessoriesShop.Data;
using MobileAccessoriesShop.Models;

namespace MobileAccessoriesShop.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : Controller
    {
        private readonly AppDbContext _db;
        public DashboardController(AppDbContext db) => _db = db;

        public async Task<IActionResult> Index()
        {
            var now = DateTime.UtcNow;
            var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            ViewBag.TotalRevenue = await _db.Orders
                .Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            ViewBag.MonthRevenue = await _db.Orders
                .Where(o => o.CreatedAt >= monthStart && o.Status != OrderStatus.Cancelled)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            ViewBag.TotalOrders = await _db.Orders.CountAsync();
            ViewBag.PendingOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Paid);
            ViewBag.TotalProducts = await _db.Products.CountAsync();
            ViewBag.LowStock = await _db.Products.CountAsync(p => p.StockQuantity < 5 && p.IsActive);
            ViewBag.TotalCustomers = await _db.Users.CountAsync();

            var recentOrders = await _db.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .Take(10)
                .ToListAsync();

            return View(recentOrders);
        }
    }
}
