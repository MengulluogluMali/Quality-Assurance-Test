using Microsoft.AspNetCore.Identity;
using MobileStore.Models;

namespace MobileStore.Data;

public static class DbSeeder
{
    public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
    {
        // Get roles and user manager
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
        var dbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();

        // Create roles
        string[] roleNames = { "Admin", "Customer" };
        foreach (var roleName in roleNames)
        {
            var roleExist = await roleManager.RoleExistsAsync(roleName);
            if (!roleExist)
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // Create Admin User
        var adminEmail = "admin@store.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            var newAdmin = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };
            
            var createPowerUser = await userManager.CreateAsync(newAdmin, "Admin@123");
            if (createPowerUser.Succeeded)
            {
                await userManager.AddToRoleAsync(newAdmin, "Admin");
            }
        }

        // Seed Dummy Products
        if (!dbContext.Products.Any())
        {
            dbContext.Products.AddRange(new List<Product>
            {
                new Product
                {
                    Name = "Ultra Slim iPhone 15 Pro Case",
                    Description = "Carbon fiber texture ultra slim fit case.",
                    Price = 29.99m,
                    ImageUrl = "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&q=80&w=600",
                    Category = "Case",
                    Stock = 50
                },
                new Product
                {
                    Name = "20W Fast USB-C Charger",
                    Description = "Compact high-speed charging brick.",
                    Price = 19.99m,
                    ImageUrl = "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600",
                    Category = "Charger",
                    Stock = 100
                },
                new Product
                {
                    Name = "Tempered Glass Screen Protector",
                    Description = "9H hardness, scratch-resistant glass.",
                    Price = 14.99m,
                    ImageUrl = "https://images.unsplash.com/photo-1544078759-4aeec0ae6724?auto=format&fit=crop&q=80&w=600",
                    Category = "Screen Protector",
                    Stock = 200
                }
            });

            await dbContext.SaveChangesAsync();
        }
    }
}
