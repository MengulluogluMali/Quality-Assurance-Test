using System.ComponentModel.DataAnnotations;

namespace MobileShop.Models;

public class Category
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string IconClass { get; set; } = "bi-grid";

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
