using Microsoft.AspNetCore.Identity;
using MobileShop.Models;

namespace MobileShop.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Seed Roles
        if (!await roleManager.RoleExistsAsync("Admin"))
        {
            await roleManager.CreateAsync(new IdentityRole("Admin"));
        }
        if (!await roleManager.RoleExistsAsync("Customer"))
        {
            await roleManager.CreateAsync(new IdentityRole("Customer"));
        }

        // Seed Admin User
        var adminEmail = "admin@mobileshop.com";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Seed Categories
        if (!context.Categories.Any())
        {
            var categories = new List<Category>
            {
                new() { Name = "Phone Cases", Description = "Protective and stylish cases for all phone brands", IconClass = "bi-phone" },
                new() { Name = "Chargers & Cables", Description = "Fast chargers, wireless chargers, and premium cables", IconClass = "bi-lightning-charge" },
                new() { Name = "Screen Protectors", Description = "Tempered glass and film protectors for crystal-clear protection", IconClass = "bi-shield-check" },
                new() { Name = "Earphones & Audio", Description = "Wired and wireless earphones, speakers, and audio accessories", IconClass = "bi-headphones" },
                new() { Name = "Car Mounts & Holders", Description = "Sturdy mounts and holders for car, desk, and more", IconClass = "bi-car-front" },
                new() { Name = "Power Banks", Description = "Portable power banks to keep your devices charged on the go", IconClass = "bi-battery-charging" }
            };
            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        // Seed Products
        if (!context.Products.Any())
        {
            var categories = context.Categories.ToList();
            var products = new List<Product>
            {
                // Phone Cases
                new() {
                    Name = "Premium Leather Wallet Case",
                    Description = "Handcrafted genuine leather wallet case with card slots and magnetic closure. Compatible with iPhone 15 Pro Max. Features RFID blocking technology and a kickstand function.",
                    Price = 34.99m, Stock = 50, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Phone Cases").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop"
                },
                new() {
                    Name = "Crystal Clear Slim Case",
                    Description = "Ultra-thin transparent case with anti-yellowing technology. Military-grade drop protection with raised bezels for camera and screen protection.",
                    Price = 14.99m, Stock = 120, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Phone Cases").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop"
                },
                new() {
                    Name = "Rugged Armor Shield Case",
                    Description = "Heavy-duty dual-layer protection with built-in kickstand. Shock-absorbing TPU core with hard polycarbonate shell. Textured grip for secure handling.",
                    Price = 24.99m, Stock = 75, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Phone Cases").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&h=400&fit=crop"
                },

                // Chargers & Cables
                new() {
                    Name = "65W GaN USB-C Fast Charger",
                    Description = "Compact GaN charger with 65W USB-C power delivery. Charges MacBook Air, iPhone, and Samsung Galaxy at full speed. 50% smaller than traditional chargers.",
                    Price = 39.99m, Stock = 60, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Chargers & Cables").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop"
                },
                new() {
                    Name = "Magnetic Wireless Charger Pad",
                    Description = "15W magnetic wireless charging pad with LED indicator. Compatible with MagSafe and Qi-enabled devices. Anti-slip silicone base with built-in cooling fan.",
                    Price = 29.99m, Stock = 85, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Chargers & Cables").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1615526675159-e248c68ef0e7?w=400&h=400&fit=crop"
                },
                new() {
                    Name = "Braided USB-C to Lightning Cable",
                    Description = "MFi certified 6ft braided cable with reinforced connectors. Supports 30W fast charging and 480Mbps data transfer. 10,000+ bend tested.",
                    Price = 16.99m, Stock = 200, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Chargers & Cables").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop"
                },

                // Screen Protectors
                new() {
                    Name = "9H Tempered Glass Protector (2-Pack)",
                    Description = "Ultra-clear 9H hardness tempered glass with oleophobic coating. Easy bubble-free installation with alignment frame included. 99.9% transparency with fingerprint-resistant surface.",
                    Price = 12.99m, Stock = 150, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Screen Protectors").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop"
                },
                new() {
                    Name = "Privacy Screen Protector",
                    Description = "Anti-spy tempered glass that limits viewing angle to 60°. Prevents visual hacking in public spaces. Full edge-to-edge coverage with smooth touch sensitivity.",
                    Price = 19.99m, Stock = 90, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Screen Protectors").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=400&h=400&fit=crop"
                },

                // Earphones & Audio
                new() {
                    Name = "True Wireless ANC Earbuds",
                    Description = "Active noise cancelling with transparency mode. 8-hour battery life with 32-hour charging case. IPX5 waterproof with touch controls and voice assistant support.",
                    Price = 59.99m, Stock = 40, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Earphones & Audio").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop"
                },
                new() {
                    Name = "USB-C Wired Earphones with Mic",
                    Description = "Hi-Res audio certified wired earphones with USB-C connector. Built-in DAC for superior sound quality. Tangle-free flat cable with inline remote.",
                    Price = 22.99m, Stock = 100, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Earphones & Audio").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop"
                },

                // Car Mounts & Holders
                new() {
                    Name = "Magnetic Car Air Vent Mount",
                    Description = "Strong N52 neodymium magnets for one-handed operation. 360° rotation with secure clip for car air vents. Compatible with all smartphones and MagSafe cases.",
                    Price = 18.99m, Stock = 70, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Car Mounts & Holders").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1600293952584-59265f257ec3?w=400&h=400&fit=crop"
                },

                // Power Banks
                new() {
                    Name = "20000mAh Slim Power Bank",
                    Description = "Ultra-slim 20000mAh power bank with dual USB-A and USB-C ports. 22.5W fast charging output. LED digital display showing exact battery percentage.",
                    Price = 44.99m, Stock = 55, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Power Banks").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop"
                },
                new() {
                    Name = "MagSafe Wireless Power Bank",
                    Description = "5000mAh magnetic wireless power bank that snaps onto your iPhone. 7.5W wireless + 20W wired charging. Pass-through charging when plugged in.",
                    Price = 34.99m, Stock = 45, IsActive = true,
                    CategoryId = categories.First(c => c.Name == "Power Banks").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&h=400&fit=crop"
                },
            };

            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }
    }
}
