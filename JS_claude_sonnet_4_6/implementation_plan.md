# Mobile Phone Accessories E-Commerce Store (JavaScript Full Stack)

A complete, production-ready e-commerce platform built with a modern JavaScript stack. The store will support product management, user accounts, cart/checkout, Stripe payments, and real-time purchase notifications (email + SMS).

---

## User Review Required

> [!IMPORTANT]
> **Notification Options** — The app will send you both **email + SMS** notifications on every purchase. For SMS, this uses **Twilio** (requires a free/paid Twilio account). If you'd prefer email-only notifications, Twilio can be omitted. Please confirm.

> [!IMPORTANT]
> **Payment Mode** — Stripe will be configured in **test mode** initially. You can go live by simply swapping your API keys. You'll need both a **Stripe account** and a **Twilio account** (both have free tiers).

> [!WARNING]
> **Secrets & API Keys** — You will need to fill in a `.env` file with your own keys (Stripe, Twilio, email SMTP). This file will NOT be committed to version control. I'll provide a `.env.example` with all required fields clearly labeled.

---

## Architecture Overview

```
mobile-accessories-store/
├── backend/          ← Node.js + Express REST API
│   ├── src/
│   │   ├── routes/   ← Auth, Products, Cart, Orders
│   │   ├── models/   ← SQLite models via better-sqlite3
│   │   ├── middleware/
│   │   └── services/ ← Email (Nodemailer), SMS (Twilio)
│   └── server.js
├── frontend/         ← Vite + React SPA
│   ├── src/
│   │   ├── pages/    ← Home, Shop, Cart, Checkout, Admin, Auth
│   │   ├── components/
│   │   ├── context/  ← Auth + Cart context
│   │   └── api/      ← Axios API client
│   └── index.html
└── .env.example
```

**Tech Stack:**
| Layer | Technology | Reason |
|---|---|---|
| Frontend | **Vite + React** | Fast, modern, component-based |
| Backend | **Node.js + Express** | Lightweight, full JS stack |
| Database | **SQLite (better-sqlite3)** | Zero config, file-based, easy to start |
| Auth | **JWT + bcrypt** | Stateless, secure |
| Payments | **Stripe** | Industry standard, secure PCI-compliant |
| Email | **Nodemailer** | Send emails via Gmail/SMTP |
| SMS | **Twilio** | SMS/WhatsApp notifications to your phone |
| Styling | **Vanilla CSS (custom)** | Premium dark-mode, glassmorphism |

---

## Proposed Changes

### Backend — `backend/`

#### [NEW] `server.js`
Express server entry point. Registers all routes, CORS, JSON middleware, and starts listening.

#### [NEW] `src/models/db.js`
SQLite database setup using `better-sqlite3`. Initializes tables:
- `users` — id, name, email, password_hash, role (admin/customer), created_at
- `products` — id, name, description, price, stock, category, image_url, created_at
- `cart_items` — id, user_id, product_id, quantity
- `orders` — id, user_id, total, status, stripe_payment_id, created_at
- `order_items` — id, order_id, product_id, quantity, price_at_purchase

#### [NEW] `src/routes/auth.js`
- `POST /api/auth/register` — Create account (bcrypt password hash, return JWT)
- `POST /api/auth/login` — Validate credentials, return JWT
- `GET /api/auth/me` — Return current user from token

#### [NEW] `src/routes/products.js`
- `GET /api/products` — List all products (with optional category/search filter)
- `GET /api/products/:id` — Single product detail
- `POST /api/products` — [Admin only] Add product
- `PUT /api/products/:id` — [Admin only] Update product
- `DELETE /api/products/:id` — [Admin only] Delete product

#### [NEW] `src/routes/cart.js`
- `GET /api/cart` — Get user's cart items
- `POST /api/cart` — Add item to cart
- `PATCH /api/cart/:id` — Update quantity
- `DELETE /api/cart/:id` — Remove item from cart

#### [NEW] `src/routes/orders.js`
- `POST /api/orders/create-payment-intent` — Create Stripe PaymentIntent
- `POST /api/orders/confirm` — Confirm order after Stripe success, clear cart, trigger notifications
- `GET /api/orders` — [Admin] List all orders
- `GET /api/orders/my` — User's own order history

#### [NEW] `src/middleware/auth.js`
JWT verification middleware. Attaches `req.user` on success.

#### [NEW] `src/middleware/adminOnly.js`
Checks `req.user.role === 'admin'`, rejects otherwise with 403.

#### [NEW] `src/services/notificationService.js`
- Sends a **HTML email** to the store owner via Nodemailer whenever an order is placed (includes order summary, buyer info, items & total).
- Sends an **SMS** to your phone number via Twilio with a brief order summary.

---

### Frontend — `frontend/`

#### [NEW] `src/context/AuthContext.jsx`
React context for JWT login/logout state and user info.

#### [NEW] `src/context/CartContext.jsx`
React context for cart state, add/remove/update + syncs with backend.

#### [NEW] Pages

| Page | Route | Description |
|---|---|---|
| `HomePage.jsx` | `/` | Hero section, featured products, categories |
| `ShopPage.jsx` | `/shop` | Full product grid with filters |
| `ProductPage.jsx` | `/products/:id` | Detail view with Add to Cart |
| `CartPage.jsx` | `/cart` | Cart summary |
| `CheckoutPage.jsx` | `/checkout` | Stripe payment form |
| `OrderSuccessPage.jsx` | `/order-success` | Confirmation screen |
| `LoginPage.jsx` | `/login` | Login form |
| `RegisterPage.jsx` | `/register` | Registration form |
| `AdminPage.jsx` | `/admin` | Dashboard: add/edit/delete products, view orders |
| `OrderHistoryPage.jsx` | `/orders` | User's past orders |

#### [NEW] `src/components/`
- `Navbar.jsx` — Sticky nav with cart count badge, user menu, admin link
- `ProductCard.jsx` — Card with image, price, add-to-cart
- `ProductForm.jsx` — Admin form for add/edit product
- `CartItem.jsx` — Cart row with qty controls
- `StripeCheckout.jsx` — Stripe `PaymentElement` wrapper
- `Footer.jsx` — Footer with links

#### [NEW] `src/index.css`
Full custom CSS design system:
- Dark-mode palette (deep navy / slate background, neon accent)
- Glassmorphism cards
- Smooth hover/transition animations
- Google Fonts (Inter / Outfit)
- Responsive grid

---

## Open Questions

> [!IMPORTANT]
> 1. **Do you want SMS notifications via Twilio**, or just email notifications? (Email is easier to set up with just a Gmail account)
> 2. **What email address should receive purchase notifications?** (Will be put in `.env.example`)
> 3. **Do you want a pre-seeded admin account?** The setup script can create a default `admin@store.com` / `admin123` account automatically so you can log in right away.
> 4. **Do you want product image uploads** (via multer file upload), or just image URLs (simpler, paste a link from the web)?

---

## Verification Plan

### Automated
- Start backend with `npm run dev`, confirm all routes respond with Postman/curl
- Start frontend with `npm run dev`, verify all pages load

### Manual Browser Testing
- Register a new user account ✓
- Admin login → add/edit/delete a product ✓
- Add items to cart → checkout with Stripe test card (`4242 4242 4242 4242`) ✓
- Confirm email notification received ✓
- Confirm SMS received (if Twilio configured) ✓

### Test Card Info (Stripe Test Mode)
| Field | Value |
|---|---|
| Card Number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
