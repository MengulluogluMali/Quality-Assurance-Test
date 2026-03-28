using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileAccessoriesShop.Data;
using MobileAccessoriesShop.Models;

namespace MobileAccessoriesShop.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]
    public class CategoriesController : Controller
    {
        private readonly AppDbContext _db;
        public CategoriesController(AppDbContext db) => _db = db;

        public async Task<IActionResult> Index()
        {
            var cats = await _db.Categories
                .Include(c => c.Products)
                .ToListAsync();
            return View(cats);
        }

        [HttpPost, ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(string name, string iconClass)
        {
            var slug = name.ToLower().Replace(" ", "-").Replace("&", "and");
            _db.Categories.Add(new Category { Name = name, Slug = slug, IconClass = iconClass });
            await _db.SaveChangesAsync();
            TempData["Success"] = "Category created.";
            return RedirectToAction(nameof(Index));
        }

        [HttpPost, ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var cat = await _db.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);
            if (cat == null) return NotFound();
            if (cat.Products.Any())
            {
                TempData["Error"] = "Cannot delete a category that has products.";
                return RedirectToAction(nameof(Index));
            }
            _db.Categories.Remove(cat);
            await _db.SaveChangesAsync();
            TempData["Success"] = "Category deleted.";
            return RedirectToAction(nameof(Index));
        }
    }
}
