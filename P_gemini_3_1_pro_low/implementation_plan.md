# Mobile Accessories E-Commerce Store

This implementation plan details the architecture and features for an e-commerce website built with Python to sell mobile phone accessories. 

## Features Overview
- **User Authentication**: Customers can register, log in, and manage their profiles.
- **Product Catalog**: Display phone accessories with images, descriptions, and prices.
- **Shopping Cart**: Users can add items to their cart and review them before purchase.
- **Checkout & Payments**: Integration with Stripe for secure payment processing.
- **Admin Dashboard**: An interface for you to add, edit, and remove products.
- **Order Notifications**: Automated notifications (via Email) sent to the admin whenever a successful purchase is made.

## Tech Stack
- **Backend Framework**: Python with Flask
- **Database**: SQLite (local dev) with SQLAlchemy ORM
- **Frontend**: HTML5, Vanilla CSS (Modern Dark Mode aesthetic), JavaScript
- **Payment Gateway**: Stripe API
- **Notifications**: SMTP (e.g., Gmail or Resend) for email notifications, with an option to add Twilio for SMS later.

## Proposed Components

### 1. Database Models (`models.py`)
- `User`: id, username, email, password_hash, is_admin
- `Product`: id, name, description, price, image_filename, stock
- `Order`: id, user_id, total_amount, status, created_at
- `OrderItem`: id, order_id, product_id, quantity, price_at_purchase

### 2. Routes & Views
- `auth.py`: Registration, Login, Logout routes.
- `main.py`: Home page, Product catalog, Product detail pages.
- `cart.py`: Add to cart, view cart, remove from cart, checkout flow.
- `admin.py`: Add/remove products (protected by `@admin_required` decorator).

### 3. Frontend & Aesthetics
- A premium, dark-themed UI (vibrant accent colors, glassmorphism, responsive design).
- Use Jinja2 templates for rendering HTML.

## User Review Required

> [!IMPORTANT]  
> Please review and approve this technical stack and feature list.

## Open Questions

> [!QUESTION]
> 1. **Payments**: Do you want to start with a mock checkout system or real Stripe integration immediately? If real Stripe, you will need to provide Stripe test keys.
> 2. **Notifications**: Do you prefer Email notifications using a standard SMTP server (like Gmail) or SMS notifications using Twilio?
> 3. **Framework**: I have proposed Flask as the web framework. Does this work for you, or would you prefer Django?

## Verification Plan

### Automated/Manual Verification
- Create a test admin user and add dummy mobile accessories.
- Register a test customer account.
- Add products to the cart and complete a test checkout.
- Verify that an email notification is successfully triggered.

