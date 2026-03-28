# MobileShop — Build Complete ✅

Your full-featured mobile phone accessories e-commerce store is live and running!

---

## 🖥️ How to Run the App

```powershell
cd "c:\Users\beta-\OneDrive\Masaüstü\c#sonnet\MobileAccessoriesShop"
dotnet run
```

Then open **http://localhost:5071** in your browser.

> **First run**: The database is auto-created and seeded with 12 products, 6 categories, and an admin account.

---

## 👑 Admin Login

| Field | Value |
|---|---|
| Email | `admin@mobileshop.com` |
| Password | `Admin@123` |

After logging in, click **Admin** in the navbar to access the admin panel.

---

## 📸 Screenshots

### Shop Page
![Shop page showing product grid with categories sidebar](C:/Users/beta-/.gemini/antigravity/brain/971e658d-8c06-43a1-a71b-ba9e6d51cf7b/shop_page_1774696743046.png)

### Login Page  
![Login page with dark glassmorphism card](C:/Users/beta-/.gemini/antigravity/brain/971e658d-8c06-43a1-a71b-ba9e6d51cf7b/login_page_retry_1774696762678.png)

---

## 📁 Project Structure

```
MobileAccessoriesShop/
├── Areas/Admin/          ← Admin panel (products, orders, categories, dashboard)
├── Controllers/          ← Home, Shop, Cart, Checkout, Account, Push
├── Data/                 ← AppDbContext, SeedData, Migrations/
├── Models/               ← Product, Order, CartItem, User, PushSubscription…
├── Services/             ← EmailService, CartService, StripeService, PushService
├── Views/                ← All Razor views (Home, Shop, Cart, Checkout, Account)
├── wwwroot/
│   ├── css/site.css      ← Full dark-mode design system
│   ├── js/cart.js        ← AJAX cart + toast notifications
│   ├── js/push.js        ← Browser push subscription
│   └── sw.js             ← Service worker for push notifications
├── appsettings.json      ← Configuration (email, stripe, vapid)
└── Program.cs            ← DI, middleware, seeding
```

---

## ⚙️ Configuration (`appsettings.json`)

### Email Notifications (Owner alert on each order)

Edit `appsettings.json`:

```json
"Email": {
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": 587,
  "SenderEmail": "yourshop@gmail.com",
  "SenderPassword": "your-app-password",
  "SenderName": "MobileShop",
  "OwnerEmail": "you@gmail.com"
}
```

> **Gmail tip**: Go to Google Account → Security → 2-Step Verification → App Passwords. Generate a 16-character App Password and paste it as `SenderPassword`.

### Stripe Payments (Test Mode)

1. Create a free account at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Paste your test keys:

```json
"Stripe": {
  "PublishableKey": "pk_test_...",
  "SecretKey":      "sk_test_..."
}
```

Test card: **4242 4242 4242 4242** (any expiry/CVC)

### Browser Push Notifications

Generate VAPID keys once:

```powershell
# In PowerShell, using webpush-tools or online at:
# https://vapidkeys.com/
```

Then add to `appsettings.json`:
```json
"WebPush": {
  "PublicKey":  "your-public-key",
  "PrivateKey": "your-private-key",
  "Subject":    "mailto:you@gmail.com"
}
```

When you're logged in as Admin and push is configured, you'll get a browser pop-up whenever a customer places an order.

---

## 🛒 Features Built

| Feature | Status |
|---|---|
| Product listing with search, category filter, pagination | ✅ |
| Product detail page with quantity picker | ✅ |
| Cart (guests + logged-in users, merges on login) | ✅ |
| User registration & login (ASP.NET Core Identity) | ✅ |
| Checkout with shipping form | ✅ |
| Order confirmation page | ✅ |
| Order history in user profile | ✅ |
| **Email notification to owner on every order** | ✅ |
| **Email confirmation to customer** | ✅ |
| **Email to customer when order ships** | ✅ |
| **Browser push notification to admin** | ✅ |
| Admin dashboard (revenue, order stats) | ✅ |
| Admin product management (add/edit/remove + image upload) | ✅ |
| Admin order management (status updates) | ✅ |
| Admin category management | ✅ |
| Stripe payment integration (test mode) | ✅ |
| Dark-mode premium design | ✅ |
| AJAX add-to-cart with animated badge | ✅ |
| Mobile-responsive layout | ✅ |

---

## 🚀 Making It Production-Ready

1. Change connection string to a proper SQL Server
2. Set real Stripe keys (Live mode)
3. Configure real SMTP credentials
4. Run `dotnet publish -c Release`
5. Deploy to Azure App Service, Railway, or any ASP.NET host

