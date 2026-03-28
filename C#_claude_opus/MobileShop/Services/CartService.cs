using Microsoft.EntityFrameworkCore;
using MobileShop.Data;
using MobileShop.Models;
using MobileShop.Models.ViewModels;

namespace MobileShop.Services;

public interface ICartService
{
    Task<CartViewModel> GetCartAsync(string userId);
    Task AddToCartAsync(string userId, int productId, int quantity = 1);
    Task RemoveFromCartAsync(string userId, int cartItemId);
    Task UpdateQuantityAsync(string userId, int cartItemId, int quantity);
    Task ClearCartAsync(string userId);
    Task<int> GetCartCountAsync(string userId);
}

public class CartService : ICartService
{
    private readonly ApplicationDbContext _context;
    private const decimal TaxRate = 0.08m;

    public CartService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CartViewModel> GetCartAsync(string userId)
    {
        var items = await _context.CartItems
            .Include(ci => ci.Product)
            .Where(ci => ci.UserId == userId)
            .OrderByDescending(ci => ci.DateAdded)
            .ToListAsync();

        var cartItems = items.Select(ci => new CartItemDisplay
        {
            CartItemId = ci.Id,
            ProductId = ci.ProductId,
            ProductName = ci.Product?.Name ?? "Unknown",
            ProductImage = ci.Product?.ImageUrl,
            UnitPrice = ci.Product?.Price ?? 0,
            Quantity = ci.Quantity,
            LineTotal = (ci.Product?.Price ?? 0) * ci.Quantity,
            StockAvailable = ci.Product?.Stock ?? 0
        }).ToList();

        var subtotal = cartItems.Sum(i => i.LineTotal);
        var tax = subtotal * TaxRate;

        return new CartViewModel
        {
            Items = cartItems,
            Subtotal = subtotal,
            Tax = Math.Round(tax, 2),
            Total = Math.Round(subtotal + tax, 2),
            ItemCount = cartItems.Sum(i => i.Quantity)
        };
    }

    public async Task AddToCartAsync(string userId, int productId, int quantity = 1)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null || !product.IsActive || product.Stock < quantity)
            throw new InvalidOperationException("Product is not available.");

        var existingItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);

        if (existingItem != null)
        {
            var newQty = existingItem.Quantity + quantity;
            if (newQty > product.Stock)
                throw new InvalidOperationException($"Only {product.Stock} items available in stock.");
            existingItem.Quantity = newQty;
        }
        else
        {
            _context.CartItems.Add(new CartItem
            {
                UserId = userId,
                ProductId = productId,
                Quantity = quantity
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task RemoveFromCartAsync(string userId, int cartItemId)
    {
        var item = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);

        if (item != null)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateQuantityAsync(string userId, int cartItemId, int quantity)
    {
        var item = await _context.CartItems
            .Include(ci => ci.Product)
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);

        if (item == null) return;

        if (quantity <= 0)
        {
            _context.CartItems.Remove(item);
        }
        else
        {
            if (item.Product != null && quantity > item.Product.Stock)
                throw new InvalidOperationException($"Only {item.Product.Stock} items available in stock.");
            item.Quantity = quantity;
        }

        await _context.SaveChangesAsync();
    }

    public async Task ClearCartAsync(string userId)
    {
        var items = await _context.CartItems
            .Where(ci => ci.UserId == userId)
            .ToListAsync();

        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
    }

    public async Task<int> GetCartCountAsync(string userId)
    {
        return await _context.CartItems
            .Where(ci => ci.UserId == userId)
            .SumAsync(ci => ci.Quantity);
    }
}
