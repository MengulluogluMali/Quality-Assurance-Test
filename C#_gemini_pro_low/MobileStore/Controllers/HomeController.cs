using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileStore.Data;

namespace MobileStore.Controllers {
    public class HomeController : Controller {
        private readonly ApplicationDbContext _context;
        public HomeController(ApplicationDbContext context) { _context = context; }
        
        public async Task<IActionResult> Index() {
            var products = await _context.Products.Include(p => p.Category).Take(6).ToListAsync();
            return View(products);
        }
    }
}\n