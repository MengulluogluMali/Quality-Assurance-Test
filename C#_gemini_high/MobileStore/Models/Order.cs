using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MobileStore.Models;

public class Order
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty; // Identity User String ID

    public DateTime OrderDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [Required]
    public string ShippingAddress { get; set; } = string.Empty;

    // e.g. Pending, Completed, Cancelled
    public string Status { get; set; } = "Pending";

    public List<OrderItem> OrderItems { get; set; } = new();
}
