using Microsoft.EntityFrameworkCore;
using MobileShop.Data;
using MobileShop.Models;
using MobileShop.Models.ViewModels;

namespace MobileShop.Services;

public interface IOrderService
{
    Task<Order> PlaceOrderAsync(string userId, CheckoutViewModel checkoutVM);
    Task<List<Order>> GetUserOrdersAsync(string userId);
    Task<List<Order>> GetAllOrdersAsync();
    Task<Order?> GetOrderAsync(int orderId);
    Task UpdateOrderStatusAsync(int orderId, OrderStatus status);
}

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;
    private readonly ICartService _cartService;
    private const decimal TaxRate = 0.08m;

    public OrderService(ApplicationDbContext context, ICartService cartService)
    {
        _context = context;
        _cartService = cartService;
    }

    public async Task<Order> PlaceOrderAsync(string userId, CheckoutViewModel checkoutVM)
    {
        var cart = await _cartService.GetCartAsync(userId);

        if (!cart.Items.Any())
            throw new InvalidOperationException("Cart is empty.");

        // Verify stock for all items
        foreach (var item in cart.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product == null || product.Stock < item.Quantity)
                throw new InvalidOperationException($"Insufficient stock for {item.ProductName}.");
        }

        // Create order
        var order = new Order
        {
            UserId = userId,
            FullName = checkoutVM.FullName,
            ShippingAddress = checkoutVM.ShippingAddress,
            City = checkoutVM.City,
            ZipCode = checkoutVM.ZipCode,
            Phone = checkoutVM.Phone,
            TotalAmount = cart.Total,
            Status = OrderStatus.Pending,
            OrderDate = DateTime.UtcNow
        };

        // Add order items and decrement stock
        foreach (var item in cart.Items)
        {
            order.OrderItems.Add(new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            });

            var product = await _context.Products.FindAsync(item.ProductId);
            if (product != null)
            {
                product.Stock -= item.Quantity;
            }
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Clear cart
        await _cartService.ClearCartAsync(userId);

        return order;
    }

    public async Task<List<Order>> GetUserOrdersAsync(string userId)
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    public async Task<List<Order>> GetAllOrdersAsync()
    {
        return await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderAsync(int orderId)
    {
        return await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }

    public async Task UpdateOrderStatusAsync(int orderId, OrderStatus status)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order != null)
        {
            order.Status = status;
            await _context.SaveChangesAsync();
        }
    }
}
