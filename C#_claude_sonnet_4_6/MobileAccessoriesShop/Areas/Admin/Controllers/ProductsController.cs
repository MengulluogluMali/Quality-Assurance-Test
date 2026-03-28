using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using MobileAccessoriesShop.Data;
using MobileAccessoriesShop.Models;

namespace MobileAccessoriesShop.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]
    public class ProductsController : Controller
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public ProductsController(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        public async Task<IActionResult> Index()
        {
            var products = await _db.Products.Include(p => p.Category).OrderByDescending(p => p.CreatedAt).ToListAsync();
            return View(products);
        }

        public async Task<IActionResult> Create()
        {
            ViewBag.Categories = new SelectList(await _db.Categories.ToListAsync(), "Id", "Name");
            return View(new Product());
        }

        [HttpPost, ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Product model, IFormFile? image)
        {
            ModelState.Remove("Category");
            ModelState.Remove("OrderItems");
            ModelState.Remove("CartItems");

            if (!ModelState.IsValid)
            {
                ViewBag.Categories = new SelectList(await _db.Categories.ToListAsync(), "Id", "Name");
                return View(model);
            }

            if (image != null && image.Length > 0)
                model.ImagePath = await SaveImageAsync(image);

            _db.Products.Add(model);
            await _db.SaveChangesAsync();
            TempData["Success"] = "Product created successfully.";
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Edit(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            ViewBag.Categories = new SelectList(await _db.Categories.ToListAsync(), "Id", "Name", product.CategoryId);
            return View(product);
        }

        [HttpPost, ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Product model, IFormFile? image)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            ModelState.Remove("Category");
            ModelState.Remove("OrderItems");
            ModelState.Remove("CartItems");

            if (!ModelState.IsValid)
            {
                ViewBag.Categories = new SelectList(await _db.Categories.ToListAsync(), "Id", "Name", model.CategoryId);
                return View(model);
            }

            product.Name = model.Name;
            product.Description = model.Description;
            product.Price = model.Price;
            product.OriginalPrice = model.OriginalPrice;
            product.StockQuantity = model.StockQuantity;
            product.CategoryId = model.CategoryId;
            product.IsActive = model.IsActive;
            product.IsFeatured = model.IsFeatured;

            if (image != null && image.Length > 0)
                product.ImagePath = await SaveImageAsync(image);

            await _db.SaveChangesAsync();
            TempData["Success"] = "Product updated successfully.";
            return RedirectToAction(nameof(Index));
        }

        [HttpPost, ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.IsActive = false; // Soft delete
            await _db.SaveChangesAsync();
            TempData["Success"] = "Product removed.";
            return RedirectToAction(nameof(Index));
        }

        private async Task<string> SaveImageAsync(IFormFile file)
        {
            var uploadsDir = Path.Combine(_env.WebRootPath, "images", "products");
            Directory.CreateDirectory(uploadsDir);
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, fileName);
            await using var stream = System.IO.File.Create(filePath);
            await file.CopyToAsync(stream);
            return $"/images/products/{fileName}";
        }
    }
}
