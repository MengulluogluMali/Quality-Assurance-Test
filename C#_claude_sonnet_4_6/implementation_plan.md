# Mobile Phone Accessories E-Commerce Store (C# / ASP.NET Core)

A full-featured e-commerce web application built with **ASP.NET Core 8 MVC**, **Entity Framework Core**, and **SQL Server LocalDB**, featuring product management, user accounts, shopping cart, secure checkout, and order notifications.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | ASP.NET Core 8 MVC |
| **ORM** | Entity Framework Core 8 + SQL Server LocalDB |
| **Auth** | ASP.NET Core Identity |
| **Email** | MailKit / SMTP (configurable) |
| **Push Notifications** | Web Push (browser) via `WebPush` NuGet package |
| **Payments** | Stripe .NET SDK (test mode) |
| **Frontend** | Razor Views + vanilla CSS + vanilla JS |
| **Image Storage** | Local disk (wwwroot/images) |

---

## User Review Required

> [!IMPORTANT]
> **Payment Processing**: The plan includes Stripe in **test mode** — no real money will be charged. A Stripe account (free) is needed for the API keys.

> [!IMPORTANT]
> **Email Notifications**: You'll need to provide SMTP credentials (Gmail App Password, Outlook, etc.) in `appsettings.json`. During development these can be configured with user secrets.

> [!IMPORTANT]
> **Push Notifications**: Browser push requires VAPID keys (generated once). All modern browsers support this. Alternatively, a mobile app notification can be simulated via push-to-phone using services like Pushover (free tier). Do you want browser push, email-only, or both?

> [!WARNING]
> **Database**: Uses SQL Server LocalDB (ships with Visual Studio). If you don't have VS installed, we'll use SQLite instead — please confirm.

---

## Proposed Changes

### 1. Project Scaffold

#### [NEW] `MobileAccessoriesShop.csproj`
ASP.NET Core 8 Web Application with MVC + Razor views.

**NuGet packages:**
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore`
- `Microsoft.EntityFrameworkCore.SqlServer` (or `.Sqlite`)
- `Microsoft.EntityFrameworkCore.Tools`
- `MailKit`
- `Stripe.net`
- `WebPush`

---

### 2. Data Layer

#### [NEW] `Data/AppDbContext.cs`
EF Core `DbContext` with these `DbSet<T>`:
- `Products` — name, description, price, stock, image path, category
- `Categories` — name, slug
- `Orders` — user FK, total, status, created date
- `OrderItems` — order FK, product FK, quantity, unit price
- `CartItems` — user FK, product FK, quantity (session-backed, persisted for logged-in users)
- `PushSubscriptions` — user FK, endpoint, keys (for browser push)

#### [NEW] `Data/Migrations/`
EF Core migrations generated via `dotnet ef migrations add`.

#### [NEW] `Data/SeedData.cs`
Seeds admin user, sample categories & sample products on first run.

---

### 3. Models

#### [NEW] `Models/Product.cs`
```
Id, Name, Description, Price, StockQuantity, ImagePath, CategoryId, CreatedAt, IsActive
```

#### [NEW] `Models/Category.cs`
```
Id, Name, Slug
```

#### [NEW] `Models/Order.cs`
```
Id, UserId, Status (Pending/Paid/Shipped/Cancelled), TotalAmount, ShippingAddress, CreatedAt
```

#### [NEW] `Models/OrderItem.cs`
```
Id, OrderId, ProductId, Quantity, UnitPrice
```

#### [NEW] `Models/CartItem.cs`
```
Id, UserId / SessionId, ProductId, Quantity
```

#### [NEW] `Models/PushSubscription.cs`
Stores browser push endpoint + auth/p256dh keys per user.

---

### 4. Identity & Auth

#### [NEW] `Models/ApplicationUser.cs`
Extends `IdentityUser` with:
- `FullName`
- `PhoneNumber` (already in IdentityUser)
- `Address`

#### [NEW] `Areas/Identity/Pages/` (Scaffolded)
- Register, Login, Logout, Account management pages
- Admin role seeded on startup

---

### 5. Controllers

#### [NEW] `Controllers/HomeController.cs`
- `Index` — featured products, hero banner
- `Shop` — product listing with category filter & search
- `Product/{id}` — product detail page

#### [NEW] `Controllers/CartController.cs`
- `Index` — view cart (session for guests, DB for logged-in)
- `Add` / `Remove` / `UpdateQuantity` — AJAX endpoints
- Cart count badge updated via AJAX

#### [NEW] `Controllers/CheckoutController.cs`
- `Index` — checkout form (shipping address, payment)
- `PlaceOrder` — creates order, calls Stripe, triggers notification
- `Confirmation/{orderId}` — success page

#### [NEW] `Controllers/AccountController.cs`
- View order history, profile management

#### [NEW] `Areas/Admin/Controllers/`

**`DashboardController`** — sales stats, recent orders

**`ProductsController`** — full CRUD with image upload

**`OrdersController`** — list orders, update status (triggers email on ship)

**`CategoriesController`** — CRUD

---

### 6. Services

#### [NEW] `Services/EmailService.cs`
Uses **MailKit** to send:
- Order confirmation to customer
- New order notification to you (the shop owner) — **this is your "get notified" feature**
- Order shipped notification to customer

Config via `appsettings.json`:
```json
"Email": {
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": 587,
  "SenderEmail": "your@email.com",
  "SenderPassword": "...",
  "OwnerEmail": "your@email.com"
}
```

#### [NEW] `Services/PushNotificationService.cs`
Uses **WebPush** to send browser push to the admin when an order is placed.

#### [NEW] `Services/CartService.cs`
Handles cart logic — merges guest cart into user cart on login.

#### [NEW] `Services/StripeService.cs`
Wraps Stripe `PaymentIntent` creation and confirmation.

---

### 7. Frontend / Views

#### Design System
- **Color palette**: Deep navy `#0d1117` background, vibrant electric purple `#7c3aed` / teal `#06b6d4` accents, white text
- **Font**: Inter (Google Fonts)
- **Effects**: glassmorphism cards, gradient hero, smooth hover transitions, animated cart badge

#### [NEW] `Views/Shared/_Layout.cshtml`
- Sticky navbar with cart icon + item count badge
- Search bar
- Dark mode by default
- Mobile-responsive hamburger menu

#### [NEW] `Views/Home/Index.cshtml`
- Full-width hero with CTA
- Category pills
- Featured products grid with hover effects

#### [NEW] `Views/Shop/Index.cshtml`
- Left sidebar: category filter, price range slider
- Product grid with add-to-cart buttons
- Pagination

#### [NEW] `Views/Cart/Index.cshtml`
- Quantity controls, remove buttons (AJAX)
- Order summary sidebar
- Proceed to checkout CTA

#### [NEW] `Views/Checkout/Index.cshtml`
- Multi-step form: Shipping → Payment → Confirm
- Stripe card element (embedded, PCI-compliant)

#### [NEW] `wwwroot/css/site.css`
Full custom dark-mode design system.

#### [NEW] `wwwroot/js/cart.js`
Cart AJAX logic, quantity updates, badge animation.

#### [NEW] `wwwroot/js/push.js`
Service worker registration + push subscription logic.

---

### 8. Admin Area

#### [NEW] `Areas/Admin/Views/`
- Protected by `[Authorize(Roles = "Admin")]`
- Dashboard: charts (Chart.js), recent orders table
- Products: DataTable with image preview, inline edit
- Orders: status update dropdown, email customer button

---

### 9. Configuration

#### [NEW] `appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MobileShopDb;Trusted_Connection=true"
  },
  "Email": { ... },
  "Stripe": {
    "PublishableKey": "pk_test_...",
    "SecretKey": "sk_test_..."
  },
  "WebPush": {
    "PublicKey": "...",
    "PrivateKey": "...",
    "Subject": "mailto:you@email.com"
  }
}
```

---

## Open Questions

> [!IMPORTANT]
> **1. Database**: SQL Server LocalDB (needs Visual Studio) or **SQLite** (works everywhere, zero setup)?

> [!IMPORTANT]
> **2. Notifications**: Email-only for order alerts, or also **browser push notifications** (popup on your PC/phone when an order comes in)?

> [!IMPORTANT]
> **3. Payments**: Include **Stripe** test-mode payment flow, or skip payments for now and just simulate a checkout?

> [!IMPORTANT]
> **4. Phone notifications**: Did you mean a mobile push notification to a phone app (requires a native app or PWA), or is **email to your phone** sufficient? Alternatively I can integrate **Pushover** (free service, ~ 1 minute setup) which sends a real push notification to your iPhone/Android via their free app.

---

## Verification Plan

### Automated
- Run `dotnet build` — confirm zero errors
- Run `dotnet ef database update` — confirm migrations apply
- Run `dotnet run` — confirm startup

### Manual Verification
1. Register as a new user → confirm account
2. Browse shop → add items to cart
3. Complete checkout with Stripe test card `4242 4242 4242 4242`
4. Verify order confirmation email received
5. Log into admin → view new order
6. Update order status to "Shipped" → verify customer email triggered
7. Verify owner notification email received on order placement

