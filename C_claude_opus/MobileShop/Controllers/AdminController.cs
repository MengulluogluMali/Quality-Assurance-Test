using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileShop.Data;
using MobileShop.Models;
using MobileShop.Models.ViewModels;
using MobileShop.Services;

namespace MobileShop.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly IOrderService _orderService;

    public AdminController(ApplicationDbContext context, IOrderService orderService)
    {
        _context = context;
        _orderService = orderService;
    }

    public async Task<IActionResult> Dashboard()
    {
        var now = DateTime.UtcNow;
        var orders = await _context.Orders.ToListAsync();

        var model = new AdminDashboardViewModel
        {
            TotalOrders = orders.Count,
            TotalProducts = await _context.Products.CountAsync(),
            TotalUsers = await _context.Users.CountAsync(),
            TotalRevenue = orders.Sum(o => o.TotalAmount),
            PendingOrders = orders.Count(o => o.Status == OrderStatus.Pending),
            RecentOrders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.OrderDate)
                .Take(10)
                .ToListAsync(),
            MonthlyRevenues = orders
                .Where(o => o.OrderDate >= now.AddMonths(-6))
                .GroupBy(o => o.OrderDate.ToString("MMM yyyy"))
                .Select(g => new MonthlyRevenue { Month = g.Key, Revenue = g.Sum(o => o.TotalAmount) })
                .ToList()
        };

        return View(model);
    }

    public async Task<IActionResult> Products()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return View(products);
    }

    public async Task<IActionResult> CreateProduct()
    {
        ViewBag.Categories = await _context.Categories.ToListAsync();
        return View(new ProductViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateProduct(ProductViewModel model)
    {
        if (!ModelState.IsValid)
        {
            ViewBag.Categories = await _context.Categories.ToListAsync();
            return View(model);
        }

        var product = new Product
        {
            Name = model.Name,
            Description = model.Description,
            Price = model.Price,
            ImageUrl = model.ImageUrl,
            CategoryId = model.CategoryId,
            Stock = model.Stock,
            IsActive = model.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        TempData["Success"] = "Product created successfully!";
        return RedirectToAction(nameof(Products));
    }

    public async Task<IActionResult> EditProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        ViewBag.Categories = await _context.Categories.ToListAsync();

        var model = new ProductViewModel
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            ImageUrl = product.ImageUrl,
            CategoryId = product.CategoryId,
            Stock = product.Stock,
            IsActive = product.IsActive
        };

        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditProduct(int id, ProductViewModel model)
    {
        if (!ModelState.IsValid)
        {
            ViewBag.Categories = await _context.Categories.ToListAsync();
            return View(model);
        }

        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.Name = model.Name;
        product.Description = model.Description;
        product.Price = model.Price;
        product.ImageUrl = model.ImageUrl;
        product.CategoryId = model.CategoryId;
        product.Stock = model.Stock;
        product.IsActive = model.IsActive;

        await _context.SaveChangesAsync();

        TempData["Success"] = "Product updated successfully!";
        return RedirectToAction(nameof(Products));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product != null)
        {
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Product deleted successfully!";
        }

        return RedirectToAction(nameof(Products));
    }

    public async Task<IActionResult> Orders()
    {
        var orders = await _orderService.GetAllOrdersAsync();
        return View(orders);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateOrderStatus(int id, OrderStatus status)
    {
        await _orderService.UpdateOrderStatusAsync(id, status);
        TempData["Success"] = "Order status updated!";
        return RedirectToAction(nameof(Orders));
    }
}
