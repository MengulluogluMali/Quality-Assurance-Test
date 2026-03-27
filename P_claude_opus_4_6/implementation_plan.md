# Mobile Phone Accessories E-Commerce Website

Build a full-featured e-commerce website using **Django** (Python) for selling mobile phone accessories. The site includes product management, user accounts, shopping cart, checkout, and email notifications on purchase.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5.x + SQLite |
| Frontend | Django templates + vanilla CSS |
| Auth | Django built-in auth system |
| Notifications | Django email (console backend for dev, SMTP for production) |
| Admin | Django admin panel (product CRUD) |

---

## Proposed Changes

### Project Scaffolding

#### [NEW] `manage.py` — Django management script
#### [NEW] `ecommerce/settings.py` — Project settings (DB, email, static files, apps)
#### [NEW] `ecommerce/urls.py` — Root URL configuration
#### [NEW] `ecommerce/wsgi.py` / `ecommerce/asgi.py` — WSGI/ASGI entry points
#### [NEW] `requirements.txt` — Django dependency

---

### Shop App — Product Catalog & Cart

#### [NEW] `shop/models.py`
- `Category` — name, slug, image
- `Product` — name, slug, description, price, stock, image, category FK, created/updated timestamps
- `Cart` / `CartItem` — session-based cart with product FK, quantity

#### [NEW] `shop/admin.py`
- Register `Category` and `Product` with Django admin for easy add/remove/edit

#### [NEW] `shop/views.py`
- `product_list` — filterable product catalog with category sidebar
- `product_detail` — single product page with add-to-cart
- `cart_detail` — view cart, update quantities, remove items
- `cart_add` / `cart_remove` — cart manipulation endpoints

#### [NEW] `shop/urls.py` — URL routing for shop views
#### [NEW] `shop/cart.py` — Session-based cart utility class
#### [NEW] `shop/forms.py` — Add-to-cart form

#### [NEW] Templates (`shop/templates/shop/`)
- `base.html` — master layout with nav, footer, fonts
- `product_list.html` — product grid
- `product_detail.html` — product showcase
- `cart_detail.html` — cart page

---

### Accounts App — User Registration & Auth

#### [NEW] `accounts/views.py`
- `register` — user signup with email
- Login/logout via Django's built-in auth views

#### [NEW] `accounts/forms.py` — Registration form extending `UserCreationForm`
#### [NEW] `accounts/urls.py` — Auth URL routing

#### [NEW] Templates (`accounts/templates/accounts/`)
- `register.html`, `login.html`

---

### Orders App — Checkout & Notifications

#### [NEW] `orders/models.py`
- `Order` — user FK, email, address, total, paid status, created timestamp
- `OrderItem` — order FK, product FK, price, quantity

#### [NEW] `orders/views.py`
- `checkout` — order form + order creation from cart
- `order_complete` — confirmation page
- Sends **email notification** to admin on successful order

#### [NEW] `orders/forms.py` — Checkout/address form
#### [NEW] `orders/admin.py` — Order management in admin
#### [NEW] `orders/urls.py`

#### [NEW] Templates (`orders/templates/orders/`)
- `checkout.html`, `order_complete.html`

---

### Static Assets

#### [NEW] `static/css/style.css`
- Premium dark-mode design with gradients, glassmorphism cards, smooth transitions
- Google Fonts (Inter), responsive grid layout, micro-animations

#### [NEW] `static/images/`
- Generated hero/placeholder images for categories

---

## Notification System

- On every successful order, an email is sent to the configured admin email
- In **development**: uses Django's console email backend (prints to terminal)
- In **production**: configurable SMTP (Gmail, SendGrid, etc.)
- Email includes: order ID, customer name, items purchased, total amount

---

## Verification Plan

### Browser Testing
1. Run `python manage.py runserver` on port 8000
2. Verify product catalog loads at `http://127.0.0.1:8000/`
3. Register a new user account
4. Browse products and add items to cart
5. Go through checkout flow
6. Verify email notification appears in console output
7. Verify admin panel at `/admin/` allows adding/removing products
