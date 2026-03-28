using Microsoft.AspNetCore.Identity;
namespace MobileStore.Models {
    public class ApplicationUser : IdentityUser {
        public string? FullName { get; set; }
    }
}\n