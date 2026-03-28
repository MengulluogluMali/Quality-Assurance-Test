using Microsoft.AspNetCore.Identity;
using MobileAccessoriesShop.Models;

namespace MobileAccessoriesShop.Data
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider services)
        {
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            var db = services.GetRequiredService<AppDbContext>();

            // Ensure roles exist
            string[] roles = { "Admin", "Customer" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            // Seed admin user
            const string adminEmail = "admin@mobileshop.com";
            const string adminPassword = "Admin@123";
            if (await userManager.FindByEmailAsync(adminEmail) == null)
            {
                var admin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FullName = "Shop Admin",
                    EmailConfirmed = true
                };
                var result = await userManager.CreateAsync(admin, adminPassword);
                if (result.Succeeded)
                    await userManager.AddToRoleAsync(admin, "Admin");
            }

            // Seed categories
            if (!db.Categories.Any())
            {
                var categories = new List<Category>
                {
                    new() { Name = "Phone Cases", Slug = "phone-cases", IconClass = "fas fa-mobile-alt" },
                    new() { Name = "Chargers & Cables", Slug = "chargers-cables", IconClass = "fas fa-bolt" },
                    new() { Name = "Screen Protectors", Slug = "screen-protectors", IconClass = "fas fa-shield-alt" },
                    new() { Name = "Headphones & Earbuds", Slug = "headphones-earbuds", IconClass = "fas fa-headphones" },
                    new() { Name = "Power Banks", Slug = "power-banks", IconClass = "fas fa-battery-full" },
                    new() { Name = "Stands & Holders", Slug = "stands-holders", IconClass = "fas fa-tablet-alt" },
                };
                db.Categories.AddRange(categories);
                await db.SaveChangesAsync();
            }

            // Seed products
            if (!db.Products.Any())
            {
                var cats = db.Categories.ToList();
                var catMap = cats.ToDictionary(c => c.Slug);

                var products = new List<Product>
                {
                    new() { Name = "Premium Leather Case – iPhone 15 Pro", Description = "Handcrafted genuine leather case with magnetic closure. Slim profile, card slots, and military-grade drop protection.", Price = 49.99m, OriginalPrice = 79.99m, StockQuantity = 50, CategoryId = catMap["phone-cases"].Id, IsFeatured = true, ImagePath = "/images/products/case1.jpg" },
                    new() { Name = "Clear Crystal Case – Samsung Galaxy S24", Description = "Ultra-transparent TPU case with reinforced corners. Anti-yellowing technology keeps it crystal clear.", Price = 19.99m, StockQuantity = 75, CategoryId = catMap["phone-cases"].Id, ImagePath = "/images/products/case2.jpg" },
                    new() { Name = "GaN 65W Fast Charger", Description = "Gallium Nitride technology. Charge your phone 3x faster than standard chargers. USB-C PD 3.0 compatible.", Price = 39.99m, OriginalPrice = 59.99m, StockQuantity = 40, CategoryId = catMap["chargers-cables"].Id, IsFeatured = true, ImagePath = "/images/products/charger1.jpg" },
                    new() { Name = "Braided USB-C Cable 2m", Description = "Durable nylon-braided cable rated for 10,000+ bends. 100W fast charging support.", Price = 14.99m, StockQuantity = 120, CategoryId = catMap["chargers-cables"].Id, ImagePath = "/images/products/cable1.jpg" },
                    new() { Name = "Tempered Glass Screen Protector", Description = "9H hardness, 0.2mm ultra-thin, oleophobic coating. Preserves screen sensitivity perfectly.", Price = 12.99m, StockQuantity = 200, CategoryId = catMap["screen-protectors"].Id, ImagePath = "/images/products/screen1.jpg" },
                    new() { Name = "Privacy Screen Protector", Description = "180° viewing angle privacy filter. Protect your data in public spaces.", Price = 24.99m, StockQuantity = 60, CategoryId = catMap["screen-protectors"].Id, ImagePath = "/images/products/screen2.jpg" },
                    new() { Name = "True Wireless ANC Earbuds", Description = "Active noise cancellation, 30hr battery life with case, IPX5 water resistant. Premium Hi-Fi sound.", Price = 89.99m, OriginalPrice = 129.99m, StockQuantity = 30, CategoryId = catMap["headphones-earbuds"].Id, IsFeatured = true, ImagePath = "/images/products/earbuds1.jpg" },
                    new() { Name = "Over-Ear Bluetooth Headphones", Description = "40mm custom drivers, 50hr battery, foldable design. Perfect studio and travel companion.", Price = 69.99m, StockQuantity = 25, CategoryId = catMap["headphones-earbuds"].Id, ImagePath = "/images/products/headphones1.jpg" },
                    new() { Name = "20,000mAh Power Bank", Description = "Dual USB-C + USB-A, 65W fast charge. Enough to fully charge most phones 4-5 times.", Price = 59.99m, StockQuantity = 35, CategoryId = catMap["power-banks"].Id, IsFeatured = true, ImagePath = "/images/products/powerbank1.jpg" },
                    new() { Name = "10,000mAh Slim Power Bank", Description = "Ultra-thin pocket-size power bank. 22.5W fast charge, LED power indicator.", Price = 34.99m, StockQuantity = 55, CategoryId = catMap["power-banks"].Id, ImagePath = "/images/products/powerbank2.jpg" },
                    new() { Name = "360° Car Phone Mount", Description = "Universal magnetic car mount with 360-degree rotation. Strong suction cup base.", Price = 22.99m, StockQuantity = 80, CategoryId = catMap["stands-holders"].Id, ImagePath = "/images/products/mount1.jpg" },
                    new() { Name = "Wireless Charging Stand", Description = "15W Qi wireless charging with auto-alignment. Compatible with all Qi devices including AirPods.", Price = 44.99m, OriginalPrice = 64.99m, StockQuantity = 45, CategoryId = catMap["stands-holders"].Id, IsFeatured = true, ImagePath = "/images/products/stand1.jpg" },
                };
                db.Products.AddRange(products);
                await db.SaveChangesAsync();
            }
        }
    }
}
