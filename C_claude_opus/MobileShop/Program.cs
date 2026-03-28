using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MobileShop.Data;
using MobileShop.Hubs;
using MobileShop.Services;

var builder = WebApplication.CreateBuilder(args);

// --- Database ---
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// --- Identity ---
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.SignIn.RequireConfirmedAccount = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.LogoutPath = "/Account/Logout";
    options.AccessDeniedPath = "/Account/AccessDenied";
    options.ExpireTimeSpan = TimeSpan.FromDays(14);
});

// --- SignalR ---
builder.Services.AddSignalR();

// --- Custom Services ---
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// SMTP Settings
var smtpSettings = new SmtpSettings();
builder.Configuration.GetSection("SmtpSettings").Bind(smtpSettings);
builder.Services.AddSingleton(smtpSettings);
builder.Services.AddScoped<IEmailSender, EmailSender>();

// --- MVC ---
builder.Services.AddControllersWithViews();

var app = builder.Build();

// --- Seed Database ---
using (var scope = app.Services.CreateScope())
{
    await DbInitializer.SeedAsync(scope.ServiceProvider);
}

// --- Pipeline ---
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

// --- SignalR Hub ---
app.MapHub<NotificationHub>("/notificationHub");

// --- Routes ---
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
