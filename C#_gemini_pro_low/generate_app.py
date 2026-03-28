import os

app_dir = "MobileStore"
dirs = [
    "Models", "Data", "Controllers", "Views/Shared", "Views/Home", "Views/Products", 
    "Views/Cart", "Views/Checkout", "Views/_ViewImports", "wwwroot/css", "wwwroot/js", "wwwroot/images"
]

for d in dirs:
    os.makedirs(os.path.join(app_dir, d), exist_ok=True)

files = {}

files["MobileStore.csproj"] = """<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
  </ItemGroup>
</Project>"""

files["Program.cs"] = """using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MobileStore.Data;
using MobileStore.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddControllersWithViews();
builder.Services.AddSession();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();

app.Run();"""

files["appsettings.json"] = """{
  "ConnectionStrings": {
    "DefaultConnection": "DataSource=app.db;Cache=Shared"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}"""

files["Models/ApplicationUser.cs"] = """using Microsoft.AspNetCore.Identity;
namespace MobileStore.Models {
    public class ApplicationUser : IdentityUser {
        public string? FullName { get; set; }
    }
}"""

files["Models/Product.cs"] = """namespace MobileStore.Models {
    public class Product {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public Category? Category { get; set; }
    }
}"""

files["Models/Category.cs"] = """namespace MobileStore.Models {
    public class Category {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<Product> Products { get; set; } = new();
    }
}"""

files["Models/Order.cs"] = """namespace MobileStore.Models {
    public class Order {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public List<OrderItem> Items { get; set; } = new();
    }
}"""

files["Models/OrderItem.cs"] = """namespace MobileStore.Models {
    public class OrderItem {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order? Order { get; set; }
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}"""

files["Data/ApplicationDbContext.cs"] = """using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MobileStore.Models;

namespace MobileStore.Data {
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser> {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
    }
}"""

files["Controllers/HomeController.cs"] = """using Microsoft.AspNetCore.Mvc;
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
}"""

files["Controllers/ProductsController.cs"] = """using Microsoft.AspNetCore.Mvc;
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
}"""

files["Controllers/CartController.cs"] = """using Microsoft.AspNetCore.Mvc;
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
}"""

files["Controllers/CheckoutController.cs"] = """using Microsoft.AspNetCore.Mvc;
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
}"""

files["Views/_ViewImports.cshtml"] = """@using MobileStore
@using MobileStore.Models
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers"""

files["Views/Shared/_Layout.cshtml"] = """<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - MobileStore</title>
    <link rel="stylesheet" href="~/css/index.css" asp-append-version="true" />
</head>
<body>
    <header>
        <nav class="navbar">
            <div class="logo">MobileStore</div>
            <ul class="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/Products">Products</a></li>
                <li><a href="/Cart">Cart</a></li>
                <li><a href="/Identity/Account/Login">Login</a></li>
            </ul>
        </nav>
    </header>
    <main role="main" class="container">
        @RenderBody()
    </main>
    <footer>
        <p>&copy; 2026 - MobileStore - Premium Mobile Accessories</p>
    </footer>
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>"""

files["Views/Home/Index.cshtml"] = """@model IEnumerable<MobileStore.Models.Product>
@{
    ViewData["Title"] = "Home Page";
}

<div class="hero">
    <h1>Welcome to MobileStore</h1>
    <p>The premium destination for your mobile phone accessories.</p>
</div>

<div class="product-grid">
    @if(Model != null) {
        foreach (var item in Model) {
            <div class="product-card">
                <h3>@item.Name</h3>
                <p>@item.Price.ToString("C")</p>
                <form action="/Cart/Add" method="post">
                    <input type="hidden" name="id" value="@item.Id" />
                    <button type="submit" class="btn">Add to Cart</button>
                </form>
            </div>
        }
    }
</div>"""

files["Views/Products/Index.cshtml"] = """@model IEnumerable<MobileStore.Models.Product>
@{
    ViewData["Title"] = "Products";
}

<h2 class="page-title">All Products</h2>
<div class="product-grid">
    <!-- Dummy Data rendered here -->
    <div class="product-card">
        <h3>Premium Silicone Case - iPhone 16</h3>
        <p>$29.99</p>
        <button class="btn">Add to Cart</button>
    </div>
    <div class="product-card">
        <h3>Fast Charging Cable USB-C</h3>
        <p>$19.99</p>
        <button class="btn">Add to Cart</button>
    </div>
    <div class="product-card">
        <h3>Wireless Magnetic Charger</h3>
        <p>$49.99</p>
        <button class="btn">Add to Cart</button>
    </div>
</div>"""

files["Views/Cart/Index.cshtml"] = """@{
    ViewData["Title"] = "Shopping Cart";
}
<h2 class="page-title">Your Cart</h2>
<div class="cart-container">
    <p>Your cart has items.</p>
    <a href="/Checkout" class="btn checkout-btn">Proceed to Checkout</a>
</div>"""

files["Views/Checkout/Index.cshtml"] = """@{
    ViewData["Title"] = "Checkout";
}
<h2 class="page-title">Checkout</h2>
<form action="/Checkout/Process" method="post" class="checkout-form">
    <div class="form-group">
        <label>Shipping Address:</label>
        <input type="text" name="address" required />
    </div>
    <button type="submit" class="btn hero-btn">Place Order</button>
</form>"""

files["Views/Checkout/Success.cshtml"] = """@{
    ViewData["Title"] = "Order Success";
}
<div class="success-message">
    <h2>@TempData["Message"]</h2>
    <p>Thank you for your purchase. We have notified the admin.</p>
    <a href="/" class="btn">Return Home</a>
</div>"""

files["wwwroot/css/index.css"] = """@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

:root {
    --bg-color: #0d1117;
    --text-color: #c9d1d9;
    --primary-color: #58a6ff;
    --secondary-color: #21262d;
    --accent-color: #ff7b72;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    line-height: 1.6;
}

/* Navbar */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 5%;
    background-color: var(--secondary-color);
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.logo {
    font-weight: 800;
    font-size: 1.5rem;
    color: var(--primary-color);
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 1.5rem;
}

.nav-links a {
    color: var(--text-color);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: var(--primary-color);
}

/* Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

/* Hero Section */
.hero {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, var(--secondary-color), #000);
    border-radius: 12px;
    margin-bottom: 3rem;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #fff;
    background: -webkit-linear-gradient(45deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Product Grid */
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
}

.product-card {
    background-color: var(--secondary-color);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid #30363d;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
    border-color: var(--primary-color);
}

.product-card h3 {
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
}

.product-card p {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1.2rem;
    margin-bottom: 1rem;
}

/* Buttons */
.btn {
    display: inline-block;
    background-color: var(--primary-color);
    color: #000;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    font-weight: 800;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
    text-decoration: none;
}

.btn:hover {
    background-color: #79c0ff;
}
.btn:active {
    transform: scale(0.95);
}

/* Forms */
.checkout-form {
    max-width: 500px;
    margin: 0 auto;
    background: var(--secondary-color);
    padding: 2rem;
    border-radius: 8px;
}
.form-group {
    margin-bottom: 1rem;
}
.form-group label {
    display: block;
    margin-bottom: 0.5rem;
}
.form-group input {
    width: 100%;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #30363d;
    background: #0d1117;
    color: #fff;
}

footer {
    text-align: center;
    padding: 2rem;
    border-top: 1px solid var(--secondary-color);
    margin-top: 4rem;
}
"""

for filepath, content in files.items():
    with open(os.path.join(app_dir, filepath), "w", encoding="utf-8") as f:
        f.write(content.strip() + "\\n")

print(f"Generated ASP.NET Core MVC application in {app_dir}")
