# PhoneGear — E-Commerce Website Walkthrough

## Summary

Built a full-featured e-commerce website for mobile phone accessories using **Django 5** with a premium dark-mode design. The site is running at `http://127.0.0.1:8000/`.

---

## Pages Built

### 🏠 Homepage — Product Catalog
Product grid with category sidebar filtering, hero section, and gradient accent styling.

![Homepage with product grid and category sidebar](C:/Users/beta-/.gemini/antigravity/brain/ec7d813e-921f-41c0-8082-8f49e16f7e21/homepage.png)

### 🔐 Registration & Login
User accounts with registration form, login, and session management. Success messages appear after registration.

![Login page with success message after registration](C:/Users/beta-/.gemini/antigravity/brain/ec7d813e-921f-41c0-8082-8f49e16f7e21/login_page.png)

### 🛒 Shopping Cart
Session-based cart with quantity updates, item removal, order summary with FREE shipping, and checkout link.

![Shopping cart with 2 items and order summary](C:/Users/beta-/.gemini/antigravity/brain/ec7d813e-921f-41c0-8082-8f49e16f7e21/cart_page.png)

### 💳 Checkout
Pre-fills user data, shows order summary, and sends admin email notification on order placement.

![Checkout page with shipping form and order summary](C:/Users/beta-/.gemini/antigravity/brain/ec7d813e-921f-41c0-8082-8f49e16f7e21/checkout_page.png)

---

## Full Purchase Flow Recording

![Complete purchase flow from registration to order confirmation](C:/Users/beta-/.gemini/antigravity/brain/ec7d813e-921f-41c0-8082-8f49e16f7e21/full_purchase_flow_1774625296026.webp)

---

## Key Features Verified

| Feature | Status |
|---------|--------|
| Product catalog with category filtering | ✅ |
| Product detail with stock badges | ✅ |
| User registration & login | ✅ |
| Session-based shopping cart | ✅ |
| Cart badge count in navbar | ✅ |
| Checkout with pre-filled user data | ✅ |
| Order confirmation page | ✅ |
| Email notification on purchase | ✅ |
| Admin panel at `/admin/` for product CRUD | ✅ |
| Premium dark-mode responsive design | ✅ |

## Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Test User | `testuser` | `TestPass123!` |

## How to Run

```bash
cd d:\cursor_projeler\1.proje_4.6_opus
venv\Scripts\python manage.py runserver 8000
```

- **Shop:** http://127.0.0.1:8000/
- **Admin Panel:** http://127.0.0.1:8000/admin/ (add/remove products here)

## Email Notifications

Currently using Django's **console email backend** — notification emails print to the terminal. To switch to real email (e.g. Gmail), edit [ecommerce/settings.py](file:///d:/cursor_projeler/1.proje_4.6_opus/ecommerce/settings.py) and uncomment the SMTP configuration.
