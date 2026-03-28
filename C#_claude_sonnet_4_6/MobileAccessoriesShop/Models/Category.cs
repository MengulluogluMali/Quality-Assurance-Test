using System.ComponentModel.DataAnnotations;

namespace MobileAccessoriesShop.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(120)]
        public string Slug { get; set; } = string.Empty;

        public string? IconClass { get; set; }

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
