# PhoneStore Build Tasks

## Setup
- [x] Create project directory structure
- [x] Write requirements.txt
- [x] Write config.py and .env.example
- [x] Write run.py

## Backend Core
- [x] app/__init__.py (Flask factory)
- [x] app/models.py (User, Product, CartItem, Order, OrderItem)
- [x] app/notifications.py (Email + SMS)

## Auth Routes
- [x] app/auth/__init__.py
- [x] app/auth/routes.py (register, login, logout)

## Store Routes
- [x] app/store/__init__.py
- [x] app/store/routes.py (home, products, cart, checkout, webhook)

## Admin Routes
- [x] app/admin_panel/__init__.py
- [x] app/admin_panel/routes.py (dashboard, add/edit/delete product, orders)

## Frontend Templates
- [x] templates/base.html
- [x] templates/store/home.html
- [x] templates/store/products.html
- [x] templates/store/product_detail.html
- [x] templates/store/cart.html
- [x] templates/store/checkout.html
- [x] templates/store/order_success.html
- [x] templates/auth/login.html
- [x] templates/auth/register.html
- [x] templates/admin/dashboard.html
- [x] templates/admin/products.html
- [x] templates/admin/add_product.html
- [x] templates/admin/orders.html
- [x] templates/emails/purchase_notification.html

## Static Assets
- [x] static/css/style.css (premium dark design)
- [x] static/js/cart.js
- [x] static/js/main.js

## Verification
- [ ] Install dependencies and run dev server
- [ ] Test user flow end-to-end
