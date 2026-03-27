# PhoneStore — Build Walkthrough

## What Was Built

A complete Python/Flask e-commerce website for mobile phone accessories, running at **http://localhost:5000**.

---

## Screenshots

````carousel
![Homepage](C:\Users\Monster\.gemini\antigravity\brain\b0698c3e-43f1-4732-a8b7-5ed855de2a71\homepage_1774647374452.png)
<!-- slide -->
![Register Page](C:\Users\Monster\.gemini\antigravity\brain\b0698c3e-43f1-4732-a8b7-5ed855de2a71\registration_page_1774647384540.png)
<!-- slide -->
![Products Page](C:\Users\Monster\.gemini\antigravity\brain\b0698c3e-43f1-4732-a8b7-5ed855de2a71\products_page_empty_1774647398132.png)
````

---

## Features Implemented

| Feature | Details |
|---|---|
| **Storefront** | Homepage with hero, category pills, featured products, new arrivals |
| **Product Listing** | Search, sort (price/newest), category filter, pagination |
| **Product Detail** | Image, description, stock status, quantity selector, add to cart |
| **Shopping Cart** | AJAX add/update/remove (no page reloads), animated cart badge |
| **Checkout** | Stripe Elements payment form, shipping details, order summary |
| **User Accounts** | Register, login, logout, order history page |
| **Email Notifications** | Gmail SMTP — you get alerted on purchase, customer gets confirmation |
| **Admin Dashboard** | Revenue stats, recent orders, low-stock alerts |
| **Admin Products** | Add/edit/remove products with image upload (drag & drop) |
| **Admin Orders** | View all orders, filter by status, update order status inline |

---

## Getting Started (3 steps)

### Step 1 — Configure your `.env`
```bash
# Copy the example file
Copy-Item .env.example .env
# Edit it with Notepad or any editor
notepad .env
```

Fill in at minimum:
- `OWNER_EMAIL` — where purchase alerts go
- `MAIL_USERNAME` + `MAIL_PASSWORD` — Gmail + [App Password](https://myaccount.google.com/apppasswords)
- `STRIPE_PUBLIC_KEY` + `STRIPE_SECRET_KEY` — from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) (test mode is free)

> [!NOTE]
> The site works **without** Stripe and email configured — checkout will still function, just without payment processing. Perfect for testing locally.

### Step 2 — Start the server
```powershell
.\venv\Scripts\Activate.ps1
python run.py
```
Visit **http://localhost:5000**

### Step 3 — Become admin
1. Register at `/auth/register`
2. Run: `python setup_admin.py your@email.com`
3. Log back in — you'll see the **⚙️ Admin** button in the navbar

---

## Test a Purchase End-to-End

1. Add a product in Admin (`/admin/products/add`)
2. Open the store, add it to cart
3. Go to checkout, use test card `4242 4242 4242 4242` (any expiry/CVC)
4. Complete the order
5. Check your `OWNER_EMAIL` for the notification email 📧

---

## Files Created

```
phonestore/
├── app/__init__.py          # Flask factory, seeds categories
├── app/models.py            # User, Product, Category, CartItem, Order, OrderItem
├── app/notifications.py     # send_purchase_notification(), send_order_confirmation()
├── app/auth/routes.py       # /auth/register, /auth/login, /auth/logout
├── app/store/routes.py      # /, /products, /cart/*, /checkout/*
├── app/admin_panel/routes.py# /admin dashboard, products CRUD, orders
├── app/static/css/style.css # Full premium dark-mode design system
├── app/static/js/main.js    # Toasts, cart badge, AJAX add-to-cart
├── app/static/js/cart.js    # AJAX cart quantity/remove controls
├── app/templates/           # 15 Jinja2 templates
├── config.py                # Environment-based configuration
├── run.py                   # Entry point
├── setup_admin.py           # Admin promotion helper
├── requirements.txt         # Python dependencies
├── .env.example             # Config template
└── README.md                # Full documentation
```
