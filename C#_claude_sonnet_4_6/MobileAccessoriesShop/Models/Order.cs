using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MobileAccessoriesShop.Models
{
    public enum OrderStatus
    {
        Pending,
        Paid,
        Processing,
        Shipped,
        Delivered,
        Cancelled,
        Refunded
    }

    public class Order
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        public string ShippingFullName { get; set; } = string.Empty;
        [Required]
        public string ShippingAddress { get; set; } = string.Empty;
        [Required]
        public string ShippingCity { get; set; } = string.Empty;
        [Required]
        public string ShippingPostalCode { get; set; } = string.Empty;
        [Required]
        public string ShippingCountry { get; set; } = string.Empty;

        public string? StripePaymentIntentId { get; set; }
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
