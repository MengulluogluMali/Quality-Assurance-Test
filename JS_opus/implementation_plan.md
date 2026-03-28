# Mobile Phone Accessories E-Commerce Store

Build a full-featured, premium dark-themed e-commerce website for mobile phone accessories using Node.js and Express.

## User Review Required

> [!IMPORTANT]
> **Email Notifications**: The plan uses **Nodemailer** with Ethereal (a fake SMTP service) for demo purposes. In production you'd swap in real SMTP credentials (Gmail, SendGrid, etc.). Is this acceptable for now?

> [!IMPORTANT]
> **Push Notifications**: Browser-based push notifications via the **Web Push API** are included so you get instant alerts on your phone/desktop browser. Is this acceptable, or do you prefer SMS (e.g. Twilio)?

> [!IMPORTANT]
> **Payment Processing**: Checkout will be simulated (no real payment gateway). Want me to integrate Stripe in demo/test mode instead?

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| **Runtime** | Node.js |
| **Framework** | Express 4 |
| **Templates** | EJS (server-side rendered) |
| **Database** | SQLite via `better-sqlite3` |
| **Auth** | `express-session` + `bcryptjs` |
| **Email** | `nodemailer` (Ethereal for demo) |
| **Push** | `web-push` (VAPID-based browser push) |
| **Styling** | Vanilla CSS — premium dark theme with glassmorphism, gradients, micro-animations |
| **Validation** | Server-side with custom middleware |
| **Security** | `helmet`, `express-rate-limit`, parameterized SQL |

---

## Project Structure

```
js_opus/
├── package.json
├── .env                        # Environment variables
├── server.js                   # Entry point
├── config/
│   └── database.js             # SQLite connection + schema init
├── middleware/
│   ├── auth.js                 # Authentication guards
│   └── validation.js           # Input validation
├── routes/
│   ├── auth.js                 # Login, register, logout
│   ├── shop.js                 # Product browsing, detail pages
│   ├── cart.js                 # Cart AJAX API
│   ├── checkout.js             # Checkout flow
│   ├── admin.js                # Product CRUD (admin only)
│   └── notifications.js       # Push subscription endpoints
├── services/
│   ├── productService.js       # Product business logic
│   ├── userService.js          # User business logic
│   ├── cartService.js          # Cart business logic
│   ├── orderService.js         # Order/checkout logic
│   └── notificationService.js  # Email + push notifications
├── public/
│   ├── css/
│   │   └── style.css           # Full design system
│   ├── js/
│   │   ├── app.js              # Global JS (cart badge, animations)
│   │   ├── cart.js             # Cart AJAX interactions
│   │   └── push.js             # Push notification client
│   ├── images/                 # Product images (generated)
│   └── sw.js                   # Service worker for push
├── views/
│   ├── layouts/
│   │   └── main.ejs            # Base layout
│   ├── partials/
│   │   ├── header.ejs          # Navbar
│   │   ├── footer.ejs          # Footer
│   │   └── product-card.ejs    # Reusable product card
│   ├── shop/
│   │   ├── index.ejs           # Product listing / homepage
│   │   └── product.ejs         # Product detail page
│   ├── auth/
│   │   ├── login.ejs           # Login page
│   │   └── register.ejs        # Register page
│   ├── cart/
│   │   └── index.ejs           # Cart page
│   ├── checkout/
│   │   ├── index.ejs           # Checkout form
│   │   └── success.ejs         # Order confirmation
│   └── admin/
│       ├── dashboard.ejs       # Admin dashboard
│       ├── products.ejs        # Product management
│       └── product-form.ejs    # Add/edit product form
└── seed.js                     # Demo data seeder
```

---

## Database Schema

### Users
| Column | Type | Notes |
|:---|:---|:---|
| id | INTEGER | Primary key, autoincrement |
| name | TEXT | Full name |
| email | TEXT | Unique |
| password | TEXT | bcrypt-hashed |
| role | TEXT | `'customer'` or `'admin'` |
| created_at | DATETIME | Default now |

### Products
| Column | Type | Notes |
|:---|:---|:---|
| id | INTEGER | Primary key |
| name | TEXT | Product name |
| description | TEXT | Rich description |
| price | REAL | In USD |
| category | TEXT | e.g. "Cases", "Chargers", "Screen Protectors" |
| image_url | TEXT | Path to image |
| stock | INTEGER | Inventory count |
| is_active | INTEGER | 1 = listed, 0 = hidden |
| created_at | DATETIME | |

### Cart Items
| Column | Type | Notes |
|:---|:---|:---|
| id | INTEGER | Primary key |
| user_id | INTEGER | FK → Users |
| product_id | INTEGER | FK → Products |
| quantity | INTEGER | |

### Orders
| Column | Type | Notes |
|:---|:---|:---|
| id | INTEGER | Primary key |
| user_id | INTEGER | FK → Users |
| total | REAL | Order total |
| status | TEXT | `'pending'`, `'completed'`, `'cancelled'` |
| shipping_address | TEXT | JSON or plain text |
| created_at | DATETIME | |

### Order Items
| Column | Type | Notes |
|:---|:---|:---|
| id | INTEGER | Primary key |
| order_id | INTEGER | FK → Orders |
| product_id | INTEGER | FK → Products |
| quantity | INTEGER | |
| price | REAL | Price at time of purchase |

### Push Subscriptions
| Column | Type | Notes |
|:---|:---|:---|
| id | INTEGER | Primary key |
| user_id | INTEGER | FK → Users (admin) |
| subscription | TEXT | JSON push subscription object |

---

## Proposed Changes

### 1. Project Init & Configuration

#### [NEW] package.json
Initialize with all dependencies: `express`, `ejs`, `express-ejs-layouts`, `better-sqlite3`, `bcryptjs`, `express-session`, `dotenv`, `helmet`, `express-rate-limit`, `nodemailer`, `web-push`, `multer` (image uploads).

#### [NEW] .env
All config: `PORT`, `SESSION_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `ADMIN_EMAIL`.

#### [NEW] server.js
Express app setup with middleware stack, route mounting, error handling, graceful shutdown.

---

### 2. Database Layer

#### [NEW] config/database.js
- SQLite connection via `better-sqlite3`
- `initializeDatabase()` — creates all tables with foreign keys and indexes
- Prepared statement helpers

---

### 3. Authentication System

#### [NEW] routes/auth.js
- `GET /auth/register` — registration form
- `POST /auth/register` — create account
- `GET /auth/login` — login form
- `POST /auth/login` — authenticate
- `GET /auth/logout` — destroy session

#### [NEW] middleware/auth.js
- `requireAuth` — redirects unauthenticated users
- `requireAdmin` — restricts admin routes
- `attachUser` — attaches user to `res.locals` for templates

#### [NEW] services/userService.js
- `createUser()`, `authenticateUser()`, `getUserById()`

---

### 4. Product Catalog & Admin

#### [NEW] routes/shop.js
- `GET /` — homepage with featured products
- `GET /shop` — full catalog with category filter + search
- `GET /shop/:id` — product detail page

#### [NEW] routes/admin.js
- `GET /admin` — dashboard with stats (total products, orders, revenue)
- `GET /admin/products` — product list with edit/delete
- `GET /admin/products/new` — add product form
- `POST /admin/products` — create product (with image upload via multer)
- `GET /admin/products/:id/edit` — edit form
- `POST /admin/products/:id` — update product
- `POST /admin/products/:id/delete` — delete product

#### [NEW] services/productService.js
- Full CRUD operations with parameterized queries

---

### 5. Shopping Cart

#### [NEW] routes/cart.js (AJAX API)
- `GET /cart` — cart page
- `POST /api/cart/add` — add item (AJAX, returns JSON)
- `POST /api/cart/update` — update quantity
- `POST /api/cart/remove` — remove item
- `GET /api/cart/count` — badge count for navbar

#### [NEW] services/cartService.js
- Cart operations tied to user_id
- Stock validation

---

### 6. Checkout & Orders

#### [NEW] routes/checkout.js
- `GET /checkout` — checkout form (shipping address)
- `POST /checkout` — process order → triggers notification

#### [NEW] services/orderService.js
- `createOrder()` — wraps in transaction: create order + order items, decrement stock, clear cart
- `getOrdersByUser()`, `getOrderById()`

---

### 7. Notification System

#### [NEW] services/notificationService.js
- `sendEmailNotification(order)` — sends email to admin via Nodemailer
- `sendPushNotification(order)` — sends browser push to subscribed admin devices
- `notifyAdmin(order)` — calls both

#### [NEW] routes/notifications.js
- `POST /api/push/subscribe` — save push subscription
- `POST /api/push/unsubscribe` — remove subscription

---

### 8. Frontend & Design

#### [NEW] public/css/style.css
Premium dark theme design system:
- **Color palette**: Deep navy (#0a0e1a) base, electric blue (#3b82f6) accent, emerald (#10b981) success, warm amber (#f59e0b) highlights
- **Typography**: Inter from Google Fonts
- **Glassmorphism** cards with backdrop-filter blur
- **Gradient** CTAs and hero sections
- **Micro-animations**: hover lifts, skeleton loading, smooth transitions
- **Responsive**: Mobile-first grid layout

#### [NEW] All EJS views
Server-rendered pages with consistent layout, smooth page transitions, animated product cards, interactive cart with AJAX updates.

---

### 9. Demo Data

#### [NEW] seed.js
- Creates admin user (`admin@store.com` / `admin123`)
- Creates sample customer (`customer@test.com` / `customer123`)
- Seeds 12+ products across categories (Cases, Chargers, Screen Protectors, Earbuds, Cables, Stands)
- Generates product images using AI image generation

---

## Open Questions

> [!IMPORTANT]
> 1. **Email**: Ethereal (fake/demo SMTP) is fine for now, or do you have real SMTP credentials to use?
> 2. **Push vs SMS**: Browser push notifications are free and work on phone/desktop. Want SMS (Twilio) instead/additionally?
> 3. **Payments**: Simulated checkout, or integrate Stripe test mode?
> 4. **Image uploads**: Store locally in `public/images/`, or use a cloud service?

---

## Verification Plan

### Automated Tests
1. `npm start` — server starts without errors
2. Navigate to homepage — products display correctly
3. Register a new user account
4. Login / logout flow
5. Browse products, filter by category
6. Add items to cart via AJAX
7. Complete checkout flow
8. Verify email notification is sent (Ethereal inbox)
9. Verify push notification is received (browser)
10. Admin: add, edit, delete products
11. Admin: view dashboard stats

### Browser Testing
- Use browser subagent to walk through all user flows end-to-end
- Verify responsive design at different viewport widths
- Confirm all animations and transitions render properly
