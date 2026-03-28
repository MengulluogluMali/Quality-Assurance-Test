using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using MobileStore.Data;
using MobileStore.Models;

namespace MobileStore.Controllers {
    public class ProductsController : Controller {
        private readonly ApplicationDbContext _context;
        public ProductsController(ApplicationDbContext context) { _context = context; }
        
        public async Task<IActionResult> Index() {
            var products = await _context.Products.Include(p => p.Category).ToListAsync();
            return View(products);
        }

        [Authorize(Roles="Admin")]
        public IActionResult Create() { return View(); }

        [HttpPost]
        [Authorize(Roles="Admin")]
        public async Task<IActionResult> Create(Product product) {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        [Authorize(Roles="Admin")]
        public async Task<IActionResult> Delete(int id) {
            var prod = await _context.Products.FindAsync(id);
            if (prod != null) {
                _context.Products.Remove(prod);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}\n