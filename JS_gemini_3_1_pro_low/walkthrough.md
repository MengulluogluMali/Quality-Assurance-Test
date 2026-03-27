# E-Commerce Mobile Store Developed

I have built the entire JavaScript e-commerce website for mobile phone accessories from scratch as planned. The system sports a sleek, premium dark-mode aesthetic with interactive glassmorphism components as requested.

## Features Implemented

- **Frontend Application**
  - **React (using Vite)**: Fast and dynamic rendering.
  - **Premium Dark Mode UI**: A fully custom CSS design system using CSS Variables, modern 'Inter' typography, custom animations, gradients, and soft glow shadow effects. No Tailwind or third-party CSS frameworks.
  - **Dynamic Cart Sidebar**: Interactive shopping cart that slides in smoothly. Allows for adding/removing items as well as auto-calculating totals.
  - **Auth System UI**: Custom modal covering login and registration forms.
  
- **Backend Service**
  - **Node.js & Express**: API gateway serving RESTful HTTP endpoints (`/api/products`, `/api/auth`, `/api/checkout`).
  - **SQLite Database**: Automatically initializes and seeds a local `store.db` with sample products (Cases, Chargers, Screen Protectors, Earbuds).
  - **Checkout Endpoints**: Simulates processing and creates an Ethereal Mock SMTP transaction to send out a beautiful HTML order summary email. User will receive an actual URL to inspect the final email output in a browser without needing real SMTP tokens.

## Running the Application

Both servers are currently running via the terminal in the background:
- **Frontend** (Vite): [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## How to Test the Project

1. Open your browser to [http://localhost:5173](http://localhost:5173). You will immediately see the custom aesthetic layout populated with mock accessories pulled dynamically from Node.js Express.
2. Click **Login** and create a test account (e.g. `test@example.com`).
3. Click "Add to Cart" on some products.
4. Click the Cart icon in the top right to open the sidebar.
5. Click **Checkout Securely**. This will hit the backend API and send a mock Order Confirmation Email! A new browser window will open containing the final rendered email.

> [!TIP]
> This mock setup is fully structured to receive Stripe API integrations. When you are ready for real transactions, simply add `stripe.charges.create` in the `/api/checkout` backend function!
