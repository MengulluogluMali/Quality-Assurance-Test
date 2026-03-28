using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileAccessoriesShop.Data;
using MobileAccessoriesShop.Models;

namespace MobileAccessoriesShop.Controllers
{
    public class HomeController : Controller
    {
        private readonly AppDbContext _db;

        public HomeController(AppDbContext db) => _db = db;

        public async Task<IActionResult> Index()
        {
            var featured = await _db.Products
                .Include(p => p.Category)
                .Where(p => p.IsFeatured && p.IsActive)
                .Take(6)
                .ToListAsync();

            var categories = await _db.Categories.ToListAsync();

            ViewBag.FeaturedProducts = featured;
            ViewBag.Categories = categories;
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View();
        }
    }
}
