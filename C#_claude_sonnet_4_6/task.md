# Mobile Accessories Shop — Build Tasks

## Phase 1: Project Scaffold
- [/] Scaffold ASP.NET Core 8 MVC project
- [ ] Add NuGet packages (EF Core SQLite, Identity, MailKit, Stripe, WebPush)
- [ ] Configure `appsettings.json`
- [ ] Configure `Program.cs` (DI, middleware, Identity, EF)

## Phase 2: Data Layer
- [ ] `Models/ApplicationUser.cs`
- [ ] `Models/Category.cs`
- [ ] `Models/Product.cs`
- [ ] `Models/Order.cs` + `OrderItem.cs`
- [ ] `Models/CartItem.cs`
- [ ] `Models/PushSubscription.cs`
- [ ] `Data/AppDbContext.cs`
- [ ] `Data/SeedData.cs`
- [ ] EF migrations

## Phase 3: Services
- [ ] `Services/EmailService.cs`
- [ ] `Services/CartService.cs`
- [ ] `Services/StripeService.cs`
- [ ] `Services/PushNotificationService.cs`

## Phase 4: Controllers
- [ ] `HomeController.cs`
- [ ] `ShopController.cs`
- [ ] `CartController.cs`
- [ ] `CheckoutController.cs`
- [ ] `AccountController.cs`
- [ ] Admin area controllers (Dashboard, Products, Orders, Categories)

## Phase 5: Views & Frontend
- [ ] `_Layout.cshtml` (dark nav, cart badge)
- [ ] `Home/Index.cshtml` (hero, featured products)
- [ ] `Shop/Index.cshtml` (grid, filters)
- [ ] `Shop/Details.cshtml`
- [ ] `Cart/Index.cshtml`
- [ ] `Checkout/Index.cshtml` + `Confirmation.cshtml`
- [ ] Admin views (Dashboard, Products CRUD, Orders, Categories)
- [ ] `wwwroot/css/site.css` (premium dark theme)
- [ ] `wwwroot/js/cart.js`
- [ ] `wwwroot/js/push.js` + service worker

## Phase 6: Verify
- [ ] `dotnet build` passes
- [ ] `dotnet ef database update` applies migrations
- [ ] App runs and seeds data
