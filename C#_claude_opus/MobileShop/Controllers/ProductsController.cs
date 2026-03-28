using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileShop.Data;
using MobileShop.Models.ViewModels;

namespace MobileShop.Controllers;

public class ProductsController : Controller
{
    private readonly ApplicationDbContext _context;
    private const int PageSize = 9;

    public ProductsController(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index(int? category, string? search, string? sort, int page = 1)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (category.HasValue)
            query = query.Where(p => p.CategoryId == category.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || (p.Description != null && p.Description.Contains(search)));

        var totalProducts = await query.CountAsync();

        query = sort switch
        {
            "price-asc" => query.OrderBy(p => p.Price),
            "price-desc" => query.OrderByDescending(p => p.Price),
            "name" => query.OrderBy(p => p.Name),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var products = await query
            .Skip((page - 1) * PageSize)
            .Take(PageSize)
            .ToListAsync();

        var model = new ProductListViewModel
        {
            Products = products,
            Categories = await _context.Categories.ToListAsync(),
            SelectedCategoryId = category,
            SearchQuery = search,
            SortBy = sort,
            CurrentPage = page,
            TotalPages = (int)Math.Ceiling(totalProducts / (double)PageSize),
            TotalProducts = totalProducts
        };

        return View(model);
    }

    public async Task<IActionResult> Details(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

        if (product == null)
            return NotFound();

        ViewBag.RelatedProducts = await _context.Products
            .Where(p => p.CategoryId == product.CategoryId && p.Id != product.Id && p.IsActive)
            .Take(4)
            .ToListAsync();

        return View(product);
    }
}
