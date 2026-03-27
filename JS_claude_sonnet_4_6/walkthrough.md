# PhoneVault — Build Completed ✅

A full-stack JavaScript e-commerce store for mobile phone accessories, fully built and verified.

## Screenshots

````carousel
![Home Page](/C:/Users/Monster/.gemini/antigravity/brain/abf01348-3e56-41be-a2d0-3eadfa58a615/home_page_v2_1774651179123.png)
<!-- slide -->
![Shop Page — Product Grid](/C:/Users/Monster/.gemini/antigravity/brain/abf01348-3e56-41be-a2d0-3eadfa58a615/shop_page_1774651188425.png)
<!-- slide -->
![Admin Dashboard](/C:/Users/Monster/.gemini/antigravity/brain/abf01348-3e56-41be-a2d0-3eadfa58a615/admin_dashboard_1774651204408.png)
<!-- slide -->
![Admin Products Table](/C:/Users/Monster/.gemini/antigravity/brain/abf01348-3e56-41be-a2d0-3eadfa58a615/admin_products_table_1774651207218.png)
````

## How to Start

Open **two terminals** and run:

**Terminal 1 — Backend:**
```
cd mobile-accessories-store/backend
npm run dev
```
Backend starts at → `http://localhost:5000`

**Terminal 2 — Frontend:**
```
cd mobile-accessories-store/frontend
npm run dev
```
Frontend starts at → `http://localhost:5173`

> [!IMPORTANT]
> **Default admin login:** `admin@mystore.com` / `admin123`

## What Was Built

| Feature | Status |
|---|---|
| Home page (hero, categories, featured products) | ✅ |
| Shop page (search, category filter, sort) | ✅ |
| Product detail page (qty selector, add-to-cart) | ✅ |
| User registration + login (JWT auth) | ✅ |
| Shopping cart (add, remove, update qty) | ✅ |
| Stripe checkout (Payments) | ✅ |
| Order history for customers | ✅ |
| Admin dashboard (stats, product CRUD, order view) | ✅ |
| Email notifications on purchase (Nodemailer) | ✅ |
| SMS notifications on purchase (Twilio) | ✅ |
| 8 sample products auto-seeded | ✅ |
| Premium dark-mode design | ✅ |

## Project Structure

```
mobile-accessories-store/
├── backend/          ← Node.js + Express REST API (port 5000)
│   ├── .env          ← Your API keys go here
│   ├── server.js
│   └── src/
│       ├── models/db.js          SQLite (auto-creates data/store.db)
│       ├── routes/               auth, products, cart, orders
│       ├── middleware/           JWT auth, admin guard
│       └── services/notificationService.js
├── frontend/         ← Vite + React (port 5173)
│   ├── .env
│   └── src/
│       ├── pages/    10 pages
│       ├── components/
│       ├── context/  AuthContext, CartContext
│       └── index.css Full dark-mode design system
└── .env.example      ← Template for all API keys
```

## Setting Up Payments (Stripe)

1. Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)
3. Edit `backend/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY
   ```
4. Edit `frontend/.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
   ```
5. Restart both servers

**Test card:** `4242 4242 4242 4242` — any future date, any CVC

## Setting Up Email Notifications

1. Enable 2FA on your Gmail account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) → Create an App Password
3. Edit `backend/.env`:
   ```
   SMTP_USER=your_gmail@gmail.com
   SMTP_PASSWORD=your_16_char_app_password
   NOTIFICATION_EMAIL=your_gmail@gmail.com
   ```
4. Restart the backend

## Setting Up SMS Notifications (Twilio)

1. Create a [Twilio account](https://console.twilio.com) (free trial works)
2. Get a phone number and copy your Account SID + Auth Token
3. Edit `backend/.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxx
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1xxxxxxxxxx   # Your Twilio number
   OWNER_PHONE_NUMBER=+1xxxxxxxxxx    # YOUR number
   ```
4. Restart the backend

> [!NOTE]
> Both email and SMS are **optional** — the store works without them. If not configured, purchases still complete but you simply won't receive notifications.

## Changing the Admin Password

Edit `backend/.env` and change:
```
ADMIN_EMAIL=admin@mystore.com
ADMIN_PASSWORD=your_new_secure_password
```
Then **delete the database** (`backend/data/store.db`) and restart — it will be recreated with the new admin.
