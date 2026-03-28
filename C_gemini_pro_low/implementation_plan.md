# Mobile Phone Accessories E-Commerce Website

This plan outlines the architecture and steps to build a fully functional e-commerce website using C# (ASP.NET Core MVC) for selling mobile phone accessories.

## User Review Required

> [!IMPORTANT]
> **Database Choice:** Would you prefer to use **SQLite** (easier setup, file-based, great for development and small-scale deployment) or **SQL Server LocalDB**? I recommend SQLite for getting started quickly.
>
> **Notification Service:** To send emails, we'll need an SMTP server. For development, we can mock this or use a free tier service like SendGrid or Gmail SMTP. Do you have a preference?
> 
> **Payment Processing:** For users to "buy" items, do you want to integrate a real payment provider (like Stripe) in test mode, or just simulate the checkout process for now?

## Proposed Architecture

We will build the application using **ASP.NET Core MVC** (.NET 8.0) and **Entity Framework Core**.

### Core Features & Components

1.  **Product Catalog:**
    *   Models: `Product`, `Category`.
    *   Features: List products, view product details, filter by category.
2.  **Shopping Cart:**
    *   Session-based cart to allow users (even unauthenticated ones) to add items.
    *   Models: `CartItem`.
3.  **User Accounts:**
    *   Use ASP.NET Core Identity for secure authentication and authorization.
    *   Roles: `Admin` (can manage products) and `Customer` (can make purchases).
4.  **Order Management & Checkout:**
    *   Models: `Order`, `OrderItem`.
    *   Features: Convert cart to order, capture shipping info.
5.  **Admin Dashboard:**
    *   Secured area for `Admin` users to add, edit, and remove products.
6.  **Notifications:**
    *   Implement an `IEmailSender` interface to send an email to the admin whenever an `Order` is successfully placed.

## Implementation Steps

1.  **Project Initialization:**
    *   Create a new ASP.NET Core MVC project with Individual User Accounts (Identity).
    *   Install necessary NuGet packages (EF Core SQLite, etc.).
2.  **Domain Modeling & Database Setup:**
    *   Create C# models for `Product`, `Category`, `CartItem`, `Order`, `OrderItem`.
    *   Set up the `ApplicationDbContext`.
    *   Create and run initial EF Core migrations.
    *   Seed the database with sample mobile accessories.
3.  **Core Application Logic:**
    *   Implement `ProductsController` and views for the catalog.
    *   Implement `CartController` with session management.
4.  **Checkout & Notifications:**
    *   Implement `CheckoutController`.
    *   Integrate email sending logic upon order completion.
5.  **Admin Interface:**
    *   Create an Admin area or specific controllers restricted by `[Authorize(Roles = "Admin")]`.
    *   Implement CRUD operations for products.
6.  **Styling & UI:**
    *   Apply a premium, modern design matching e-commerce best practices (vibrant/dark theme options, responsive layout, smooth hover effects).

## Open Questions

> [!CAUTION]
> Please review the questions in the "User Review Required" section above and provide your preferences so we can finalize the tooling and begin execution.

## Verification Plan

### Automated Tests
*   Ensure the application builds successfully (`dotnet build`).
*   Ensure database migrations apply cleanly (`dotnet ef database update`).

### Manual Verification
*   Run the application locally and verify the UI aesthetics.
*   Register a new user account.
*   Browse the product catalog and add a mobile phone accessory to the cart.
*   Proceed to checkout and simulate placing an order.
*   Verify the admin notification logic triggers.
*   Log in as an admin and test adding/removing a product.
