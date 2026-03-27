# Mobile Accessories Store Walkthrough

I have successfully scaffolded and implemented the core functionalities for your mobile accessories store using Python with Flask.

## What Was Built

1. **Authentication System**
    - Built a robust registration and login system.
    - Added user roles, including a designated Admin account to securely manage the store.

2. **Admin Dashboard**
    - Created a protected dashboard exclusively for you.
    - Added functionalities to create, list, and delete accessories directly from the interface.

3. **Product Catalog & Cart**
    - Designed a sleek, dark-themed catalog to display your mobile phone accessories dynamically.
    - Implemented a shopping cart where logged-in users can safely add and track their selected items before checkout.

4. **Checkout Integration**
    - Set up a mock payment processor and order-generation loop.
    - Hardcoded a simulated checkout that translates into an admin notification. (We can swap this out with absolute real Stripe / SMTP API keys once you're ready to go live!)

5. **Modern Design**
    - Crafted a premium "dark mode" aesthetic using highly customized Vanilla CSS to meet your exact UI requirements.

## How to Test and Run

To run your brand new application locally, simply start the Python application from your terminal:

```bash
cd C:\Users\Monster\.gemini\antigravity\scratch\mobile_accessories_store
.\venv\Scripts\activate
python app.py
```

Then visit *http://127.0.0.1:5000* in your browser.

> [!TIP]
> You can try logging in to the admin dashboard using the default credentials:
> **Email**: `admin@lux.com`
> **Password**: `admin123`
