# ⚡ PhoneStore — Mobile Phone Accessories E-Commerce

A full-featured Python/Flask e-commerce store for mobile phone accessories.

## Features

- 🛍️ **Storefront** — Product grid with search, filter by category, sort by price/newest, pagination
- 📄 **Product Detail Pages** — Images, stock status, quick add-to-cart
- 🛒 **Shopping Cart** — AJAX quantity controls without page reloads
- 💳 **Checkout** — Stripe payment integration with secure Elements form
- 👤 **User Accounts** — Register, login, order history
- 📧 **Email Notifications** — You get alerted every time someone places an order; customers get order confirmations
- ⚙️ **Admin Panel** — Add/edit/remove products, manage orders, view dashboard stats

---

## Quick Start

### 1. Install dependencies

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Configure your environment

```powershell
Copy-Item .env.example .env
notepad .env
```

Fill in these values in `.env`:

| Variable | How to get it |
|---|---|
| `SECRET_KEY` | Any random string |
| `MAIL_USERNAME` | Your Gmail address |
| `MAIL_PASSWORD` | [Gmail App Password](https://myaccount.google.com/apppasswords) (not your regular password) |
| `OWNER_EMAIL` | Where you want purchase alerts sent |
| `STRIPE_PUBLIC_KEY` | From [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) (test mode) |
| `STRIPE_SECRET_KEY` | From Stripe Dashboard (test mode) |

### 3. Run the app

```powershell
.\venv\Scripts\Activate.ps1
python run.py
```

Visit: **http://localhost:5000**

### 4. Create your admin account

1. Register at http://localhost:5000/auth/register
2. Run the setup script with your email:

```powershell
python setup_admin.py your@email.com
```

3. Log in — you'll now see the **⚙️ Admin** button in the navbar
4. Visit **http://localhost:5000/admin** to add your first products

---

## Admin Panel

| Page | URL | What you can do |
|---|---|---|
| Dashboard | `/admin` | Stats, recent orders, low-stock alerts |
| Products | `/admin/products` | View, edit, delete products |
| Add Product | `/admin/products/add` | Add new products with image upload |
| Orders | `/admin/orders` | View all orders, update order status |

---

## Testing Payments (Stripe Test Mode)

Use these test card numbers in checkout:

| Card | Use case |
|---|---|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Declined (insufficient funds) |

Expiry: any future date. CVC: any 3 digits. ZIP: any 5 digits.

---

## Email Notifications

When enabled (`.env` configured with Gmail), two emails are sent on each purchase:
1. **You** receive a notification with order details, customer info, and shipping address.
2. **The customer** receives an HTML order confirmation email.

### Gmail App Password Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Create a new app password for "Mail"
5. Use that 16-character password as `MAIL_PASSWORD` in `.env`

---

## Project Structure

```
phonestore/
├── app/
│   ├── __init__.py        # Flask factory
│   ├── models.py          # DB models
│   ├── notifications.py   # Email alerts
│   ├── auth/              # Login/register
│   ├── store/             # Storefront & cart
│   ├── admin_panel/       # Admin routes
│   ├── static/
│   │   ├── css/style.css  # Premium dark design
│   │   ├── js/main.js     # Cart badge, toasts
│   │   ├── js/cart.js     # AJAX cart controls
│   │   └── uploads/       # Product images
│   └── templates/         # Jinja2 templates
├── config.py
├── run.py
├── setup_admin.py
├── requirements.txt
└── .env.example
```
