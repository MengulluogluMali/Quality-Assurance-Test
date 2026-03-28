using MobileAccessoriesShop.Data;
using MobileAccessoriesShop.Models;
using Microsoft.EntityFrameworkCore;

namespace MobileAccessoriesShop.Services
{
    public class CartService
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CartService(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        private string? GetUserId()
        {
            var ctx = _httpContextAccessor.HttpContext;
            return ctx?.User?.Identity?.IsAuthenticated == true
                ? ctx.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                : null;
        }

        private string GetSessionId()
        {
            var ctx = _httpContextAccessor.HttpContext!;
            if (ctx.Session.GetString("CartSessionId") == null)
                ctx.Session.SetString("CartSessionId", Guid.NewGuid().ToString());
            return ctx.Session.GetString("CartSessionId")!;
        }

        public async Task<List<CartItem>> GetCartItemsAsync()
        {
            var userId = GetUserId();
            if (userId != null)
            {
                return await _db.CartItems
                    .Include(c => c.Product)
                    .Where(c => c.UserId == userId)
                    .ToListAsync();
            }
            var sessionId = GetSessionId();
            return await _db.CartItems
                .Include(c => c.Product)
                .Where(c => c.SessionId == sessionId)
                .ToListAsync();
        }

        public async Task<int> GetCartCountAsync()
        {
            var userId = GetUserId();
            if (userId != null)
                return await _db.CartItems.Where(c => c.UserId == userId).SumAsync(c => c.Quantity);
            var sessionId = GetSessionId();
            return await _db.CartItems.Where(c => c.SessionId == sessionId).SumAsync(c => c.Quantity);
        }

        public async Task AddToCartAsync(int productId, int quantity = 1)
        {
            var userId = GetUserId();
            CartItem? existing = null;

            if (userId != null)
                existing = await _db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId);
            else
            {
                var sessionId = GetSessionId();
                existing = await _db.CartItems.FirstOrDefaultAsync(c => c.SessionId == sessionId && c.ProductId == productId);
            }

            if (existing != null)
            {
                existing.Quantity += quantity;
            }
            else
            {
                var item = new CartItem
                {
                    ProductId = productId,
                    Quantity = quantity,
                    UserId = userId,
                    SessionId = userId == null ? GetSessionId() : null
                };
                _db.CartItems.Add(item);
            }
            await _db.SaveChangesAsync();
        }

        public async Task RemoveFromCartAsync(int cartItemId)
        {
            var item = await _db.CartItems.FindAsync(cartItemId);
            if (item != null)
            {
                _db.CartItems.Remove(item);
                await _db.SaveChangesAsync();
            }
        }

        public async Task UpdateQuantityAsync(int cartItemId, int quantity)
        {
            var item = await _db.CartItems.FindAsync(cartItemId);
            if (item != null)
            {
                if (quantity <= 0)
                    _db.CartItems.Remove(item);
                else
                    item.Quantity = quantity;
                await _db.SaveChangesAsync();
            }
        }

        public async Task MergeGuestCartAsync(string userId)
        {
            var sessionId = GetSessionId();
            var guestItems = await _db.CartItems.Where(c => c.SessionId == sessionId).ToListAsync();
            foreach (var guestItem in guestItems)
            {
                var existing = await _db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == guestItem.ProductId);
                if (existing != null)
                    existing.Quantity += guestItem.Quantity;
                else
                    guestItem.UserId = userId;
                if (existing != null) _db.CartItems.Remove(guestItem);
            }
            await _db.SaveChangesAsync();
        }

        public async Task ClearCartAsync()
        {
            var userId = GetUserId();
            IQueryable<CartItem> items;
            if (userId != null)
                items = _db.CartItems.Where(c => c.UserId == userId);
            else
            {
                var sessionId = GetSessionId();
                items = _db.CartItems.Where(c => c.SessionId == sessionId);
            }
            _db.CartItems.RemoveRange(items);
            await _db.SaveChangesAsync();
        }
    }
}
