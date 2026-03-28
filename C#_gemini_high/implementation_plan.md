# C# Mobile Accessories E-Commerce Store

We are going to build a full-stack e-commerce web application specifically tailored for selling mobile phone accessories. The application will be built to handle user registration, user shopping carts, admin product management, and checkout with purchase notifications.

## User Review Required

> [!IMPORTANT]
> Since this is a completely fresh project, I'd like your approval on the proposed technology stack and features before I write any code. Which architecture and style preferences do you prefer? 
> Please review the "Open Questions" section below and let me know how you'd like to proceed!

## Proposed Technology Stack

- **Backend Framework**: ASP.NET Core MVC (C#). This is robust, provides great SEO out-of-the-box, and makes routing and page management straightforward.
- **Database**: Entity Framework Core with **SQLite**. Excellent for quick setup without needing database server installations.
- **Authentication**: ASP.NET Core Identity for secure management of Users and Roles (e.g., "Admin" to manage products, "Customer" for purchases).
- **Payment Gateway (Optional but Recommended)**: Stripe API, for handling real credit card transactions. 
- **Notifications**: Email notifications via SMTP/SendGrid, or SMS notifications via Twilio whenever an order is placed.
- **Frontend / Styling**: Vanilla CSS and Javascript with responsive, dark-mode, modern aesthetics (glassmorphism, micro-animations, premium layout).

## Proposed Changes

---
### Database & Models
Creating the core structure of the store.
- **Entities**: `User`, `Product`, `CartItem`, `Order`, `OrderItem`.
- **DbContext**: Configuring relationships in EF Core.

---
### Authentication & Roles
Secure login and registration.
- **Identity Setup**: Using built-in ASP.NET Core Identity.
- **Roles**: Seeding an "Admin" role (for you) and a regular user role (for customers).

---
### Admin Dashboard
- **Product Management**: Views for `Create`, `Read`, `Update`, `Delete` (CRUD) for mobile accessories (cases, screen protectors, chargers, etc). Only accessible by admins.

---
### Customer Frontend
- **Product Catalog**: Beautiful, responsive, and dynamic product listings.
- **Shopping Cart**: Add-to-cart functionality storing items temporarily in the user's session or database.
- **Checkout**: Order summary, shipping details, and triggering the payment/notification service.

---
### Notification Service
- **Email/SMS Trigger**: A service that fires off a notification to you containing the order details right after a successful checkout.

## Open Questions

> [!WARNING]
> I need your input on a few things before we initialize the codebase:
> 1. Do you prefer notifications exactly via **Email** or **SMS** (phone), or mock them for testing right now?
> 2. For the UI, I am planning a premium dark-mode aesthetic with smooth interactive animations. Does this sound good?
> 3. Should I set up dummy data (e.g. iPhone cases, chargers) so you can immediately see the store working?
> 4. Should we integrate a mock checkout process for testing, or do you want to plug in a real payment gateway like Stripe right away?

## Verification Plan

### Manual Verification
- Deploy locally and check website UI aesthetics.
- Register an admin account and add a dummy accessory.
- Login as a customer, add the accessory to the cart, and proceed to checkout.
- Verify that you receive an email/SMS notification that a purchase was made.
