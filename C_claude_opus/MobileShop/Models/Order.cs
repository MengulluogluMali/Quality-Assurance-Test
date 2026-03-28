using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace MobileShop.Models;

public enum OrderStatus
{
    Pending,
    Processing,
    Shipped,
    Delivered,
    Cancelled
}

public class Order
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;
    public IdentityUser? User { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    [StringLength(500)]
    public string? ShippingAddress { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(20)]
    public string? ZipCode { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(200)]
    public string? FullName { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
