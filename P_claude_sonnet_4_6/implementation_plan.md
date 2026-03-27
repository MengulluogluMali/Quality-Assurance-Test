# Mobile Phone Accessories E-Commerce Website

A full-featured online store built with Python (Flask) for selling mobile phone accessories, with admin product management, user accounts, shopping cart, checkout, and real-time purchase notifications.

---

## User Review Required

> [!IMPORTANT]
> **Notifications**: The plan uses **email notifications via Gmail SMTP** (free) for purchase alerts sent to you. An optional **SMS notification via Twilio** (paid, free trial available) can also be added. Which would you prefer, or both?

> [!IMPORTANT]
> **Payments**: The plan uses **Stripe** for processing payments. You'll need a free Stripe account (test mode is free; live mode charges a small per-transaction fee). Are you okay with this?

> [!WARNING]
> **Database**: The plan uses **SQLite** for development (zero setup). For production, it can be upgraded to PostgreSQL. Are you deploying locally first, or straight to production?

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Backend | **Flask** (Python) | Lightweight, flexible, large ecosystem |
| Database | **SQLAlchemy + SQLite** | Easy local setup, scalable to PostgreSQL |
| Auth | **Flask-Login + Werkzeug** | Battle-tested session & password hashing |
| Admin Panel | **Flask-Admin** | Built-in product/order management UI |
| Payments | **Stripe** | Industry-standard, excellent test mode |
| Email Notifs | **Flask-Mail (Gmail SMTP)** | Free, reliable |
| SMS Notifs | **Twilio** (optional) | Simple API, free trial |
| Frontend | **Jinja2 + Vanilla CSS + JS** | Clean, fast, no build step |
| Image Storage | **Local filesystem** | Simple; can be swapped for S3 later |

---

## Proposed Changes

### Project Structure

```
C:\Users\Monster\.gemini\antigravity\scratch\phonestore\
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── models.py            # DB models: User, Product, Cart, Order
│   ├── auth/                # Login, register, logout routes
│   ├── store/               # Product listing, detail, cart, checkout
│   ├── admin/               # Product add/remove/edit (owner only)
│   ├── notifications.py     # Email + optional SMS on purchase
│   ├── static/
│   │   ├── css/style.css    # Premium dark/glassmorphism design
│   │   ├── js/cart.js       # AJAX cart updates
│   │   └── uploads/         # Product images
│   └── templates/           # Jinja2 HTML templates
│       ├── base.html
│       ├── store/           # Home, product detail, cart, checkout
│       ├── auth/            # Login, register
│       └── admin/           # Admin dashboard
├── migrations/              # Flask-Migrate DB migrations
├── config.py                # App config (env vars)
├── requirements.txt
├── run.py                   # Entry point
└── .env                     # Secrets (not committed)
```

---

### [NEW] Core Application (`app/`)

#### [NEW] `app/__init__.py`
Flask app factory — initializes DB, login manager, mail, admin, Stripe.

#### [NEW] `app/models.py`
SQLAlchemy models:
- **User** — id, email, password_hash, name, is_admin, created_at
- **Product** — id, name, description, price, stock, image_filename, category, created_at
- **CartItem** — id, user_id, product_id, quantity
- **Order** — id, user_id, total, status, stripe_payment_id, created_at
- **OrderItem** — id, order_id, product_id, quantity, unit_price

#### [NEW] `app/auth/` (Authentication)
- `GET/POST /register` — Create account (email + password)
- `GET/POST /login` — Log in
- `GET /logout` — Log out

#### [NEW] `app/store/` (Storefront)
- `GET /` — Homepage: featured products, categories
- `GET /products` — Product grid with search/filter
- `GET /products/<id>` — Product detail page
- `POST /cart/add` — Add to cart (AJAX)
- `GET /cart` — View cart
- `POST /cart/update` — Update quantities
- `POST /cart/remove` — Remove item
- `GET /checkout` — Checkout page (Stripe Elements)
- `POST /checkout/process` — Create Stripe PaymentIntent
- `GET /checkout/success` — Order confirmation
- `POST /webhook/stripe` — Stripe webhook → mark order paid → send notification

#### [NEW] `app/admin/` (Owner Dashboard)
- `GET /admin` — Dashboard: orders, revenue, product count
- `GET/POST /admin/products/add` — Add product with image upload
- `GET/POST /admin/products/edit/<id>` — Edit product
- `POST /admin/products/delete/<id>` — Remove product
- `GET /admin/orders` — View all orders

#### [NEW] `app/notifications.py`
- `send_purchase_email(owner_email, order)` — Email alert with order details
- `send_sms_alert(order)` — Optional Twilio SMS alert

---

### [NEW] Frontend Design

Premium dark-mode e-commerce aesthetic:
- **Color palette**: Deep charcoal (#0D0D0D) background, electric violet (#7C3AED) accent, silver/white text
- **Glassmorphism** cards for products
- **Smooth hover animations** on product cards (scale + glow)
- **Animated cart badge** counter
- **Responsive grid** layout for products
- **Google Fonts**: Inter (body), Outfit (headings)

---

### [NEW] Configuration & Deployment Files

#### [NEW] `config.py`
```python
# Environment-based config
SECRET_KEY, DATABASE_URL, MAIL_USERNAME, MAIL_PASSWORD,
STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
TWILIO_* (optional), OWNER_EMAIL, OWNER_PHONE
```

#### [NEW] `.env.example`
Template showing all required environment variables.

#### [NEW] `requirements.txt`
```
Flask, Flask-SQLAlchemy, Flask-Login, Flask-Mail, Flask-Migrate,
Flask-Admin, stripe, python-dotenv, Werkzeug, Pillow, twilio (optional)
```

---

## Open Questions

> [!IMPORTANT]
> 1. **Notification method**: Email only, or also SMS (Twilio)?
> 2. **Payment**: Are you okay using Stripe? (Test mode works without real money)
> 3. **Deployment**: Local dev only for now, or also need deployment instructions (e.g., Railway, Render, Heroku)?
> 4. **Product categories**: Should I pre-create example categories (e.g., Cases, Chargers, Earphones, Screen Protectors)?
> 5. **Currency**: What currency should prices be displayed in?

---

## Verification Plan

### Automated
- Run the dev server and verify all routes return 200
- Test user registration → login → add to cart → checkout flow
- Test admin product add/remove

### Manual Verification (user)
- Create an account and place a test order using Stripe's test card `4242 4242 4242 4242`
- Verify you receive an email notification
- Verify admin can add/remove products
- Check mobile responsiveness
