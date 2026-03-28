using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MobileShop.Services;

namespace MobileShop.Controllers;

public class AccountController : Controller
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly IOrderService _orderService;

    public AccountController(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        IOrderService orderService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _orderService = orderService;
    }

    [HttpGet]
    public IActionResult Login(string? returnUrl = null)
    {
        if (User.Identity?.IsAuthenticated == true)
            return RedirectToAction("Index", "Home");

        ViewData["ReturnUrl"] = returnUrl;
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;

        if (!ModelState.IsValid) return View(model);

        var result = await _signInManager.PasswordSignInAsync(
            model.Email, model.Password, model.RememberMe, lockoutOnFailure: false);

        if (result.Succeeded)
        {
            return LocalRedirect(returnUrl ?? "/");
        }

        ModelState.AddModelError(string.Empty, "Invalid email or password.");
        return View(model);
    }

    [HttpGet]
    public IActionResult Register(string? returnUrl = null)
    {
        if (User.Identity?.IsAuthenticated == true)
            return RedirectToAction("Index", "Home");

        ViewData["ReturnUrl"] = returnUrl;
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model, string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;

        if (!ModelState.IsValid) return View(model);

        var user = new IdentityUser { UserName = model.Email, Email = model.Email, EmailConfirmed = true };
        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, "Customer");
            await _signInManager.SignInAsync(user, isPersistent: false);
            return LocalRedirect(returnUrl ?? "/");
        }

        foreach (var error in result.Errors)
        {
            ModelState.AddModelError(string.Empty, error.Description);
        }

        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return RedirectToAction("Index", "Home");
    }

    [Authorize]
    public async Task<IActionResult> Orders()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var orders = await _orderService.GetUserOrdersAsync(userId);
        return View(orders);
    }

    public IActionResult AccessDenied()
    {
        return View();
    }
}

public class LoginViewModel
{
    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Email is required")]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    public string Email { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Password is required")]
    [System.ComponentModel.DataAnnotations.DataType(System.ComponentModel.DataAnnotations.DataType.Password)]
    public string Password { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Display(Name = "Remember me")]
    public bool RememberMe { get; set; }
}

public class RegisterViewModel
{
    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Email is required")]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    public string Email { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Password is required")]
    [System.ComponentModel.DataAnnotations.StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
    [System.ComponentModel.DataAnnotations.DataType(System.ComponentModel.DataAnnotations.DataType.Password)]
    public string Password { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Please confirm your password")]
    [System.ComponentModel.DataAnnotations.Compare("Password", ErrorMessage = "Passwords do not match")]
    [System.ComponentModel.DataAnnotations.DataType(System.ComponentModel.DataAnnotations.DataType.Password)]
    [System.ComponentModel.DataAnnotations.Display(Name = "Confirm Password")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
