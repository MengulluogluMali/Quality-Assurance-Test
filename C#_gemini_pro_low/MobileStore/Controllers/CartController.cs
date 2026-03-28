using Microsoft.AspNetCore.Mvc;
// Simple dummy cart using session
namespace MobileStore.Controllers {
    public class CartController : Controller {
        public IActionResult Index() {
            return View(); // Mock view
        }
        [HttpPost]
        public IActionResult Add(int id) {
            // Mock logic to add to session
            return RedirectToAction("Index");
        }
    }
}\n