using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace MobileStore.Controllers {
    [Authorize]
    public class CheckoutController : Controller {
        public IActionResult Index() {
            return View();
        }

        [HttpPost]
        public IActionResult Process() {
            // Mock order creation and notification
            TempData["Message"] = "Order placed successfully! Notification sent to admin.";
            return RedirectToAction("Success");
        }

        public IActionResult Success() {
            return View();
        }
    }
}\n