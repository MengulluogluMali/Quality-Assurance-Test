"""
Seed script — populates the database with sample categories and products.
Run with: python manage.py shell < seed_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from shop.models import Category, Product

# Clear existing data
Product.objects.all().delete()
Category.objects.all().delete()

# Create categories
categories_data = [
    {'name': 'Phone Cases', 'slug': 'phone-cases'},
    {'name': 'Chargers & Cables', 'slug': 'chargers-cables'},
    {'name': 'Screen Protectors', 'slug': 'screen-protectors'},
    {'name': 'Headphones & Audio', 'slug': 'headphones-audio'},
    {'name': 'Phone Holders', 'slug': 'phone-holders'},
]

categories = {}
for cat_data in categories_data:
    cat = Category.objects.create(**cat_data)
    categories[cat.slug] = cat
    print(f"  Created category: {cat.name}")

# Create products
products_data = [
    # Phone Cases
    {'name': 'Crystal Clear Slim Case', 'slug': 'crystal-clear-slim-case',
     'category': categories['phone-cases'], 'price': 14.99, 'stock': 50,
     'description': 'Ultra-thin transparent case that shows off your phone\'s design while providing premium protection against drops and scratches.'},
    {'name': 'Carbon Fiber Shield Case', 'slug': 'carbon-fiber-shield-case',
     'category': categories['phone-cases'], 'price': 24.99, 'stock': 35,
     'description': 'Military-grade protection with a sleek carbon fiber texture. Shock-absorbing corners and raised edges protect camera and screen.'},
    {'name': 'Leather Wallet Case', 'slug': 'leather-wallet-case',
     'category': categories['phone-cases'], 'price': 34.99, 'stock': 20,
     'description': 'Premium genuine leather case with card slots and cash pocket. Doubles as a stand for hands-free viewing.'},
    {'name': 'Neon Gradient Soft Case', 'slug': 'neon-gradient-soft-case',
     'category': categories['phone-cases'], 'price': 12.99, 'stock': 60,
     'description': 'Eye-catching gradient design in vibrant neon colors. Flexible TPU material for easy installation and great grip.'},

    # Chargers & Cables
    {'name': '65W GaN Fast Charger', 'slug': '65w-gan-fast-charger',
     'category': categories['chargers-cables'], 'price': 29.99, 'stock': 40,
     'description': 'Compact GaN technology charger with 65W output. Charges your phone from 0-50% in just 20 minutes. Dual USB-C ports.'},
    {'name': 'Braided USB-C Cable 2m', 'slug': 'braided-usb-c-cable-2m',
     'category': categories['chargers-cables'], 'price': 9.99, 'stock': 100,
     'description': 'Premium nylon-braided USB-C cable rated for 100W charging. Reinforced connectors for 10x longer lifespan.'},
    {'name': 'MagSafe Wireless Charger', 'slug': 'magsafe-wireless-charger',
     'category': categories['chargers-cables'], 'price': 39.99, 'stock': 25,
     'description': '15W magnetic wireless charger with perfect alignment every time. LED indicator and foreign object detection for safety.'},
    {'name': '3-in-1 Charging Station', 'slug': '3-in-1-charging-station',
     'category': categories['chargers-cables'], 'price': 54.99, 'stock': 15,
     'description': 'Charge your phone, smartwatch, and earbuds simultaneously. Elegant nightstand design with ambient LED lighting.'},

    # Screen Protectors
    {'name': 'Tempered Glass 9H Protector', 'slug': 'tempered-glass-9h-protector',
     'category': categories['screen-protectors'], 'price': 8.99, 'stock': 80,
     'description': '9H hardness tempered glass with oleophobic coating. Bubble-free installation with alignment frame included.'},
    {'name': 'Privacy Screen Filter', 'slug': 'privacy-screen-filter',
     'category': categories['screen-protectors'], 'price': 16.99, 'stock': 30,
     'description': 'Anti-spy privacy filter that blocks side-angle viewing at 28 degrees. Full protection + privacy in one.'},
    {'name': 'Anti-Glare Matte Protector', 'slug': 'anti-glare-matte-protector',
     'category': categories['screen-protectors'], 'price': 11.99, 'stock': 45,
     'description': 'Matte finish eliminates glare for comfortable outdoor use. Smooth fingerprint-resistant surface.'},

    # Headphones & Audio
    {'name': 'ProBass Wireless Earbuds', 'slug': 'probass-wireless-earbuds',
     'category': categories['headphones-audio'], 'price': 49.99, 'stock': 30,
     'description': 'Active noise cancellation with 30-hour battery life. IPX5 waterproof with premium sound drivers for deep bass.'},
    {'name': 'Compact Bluetooth Speaker', 'slug': 'compact-bluetooth-speaker',
     'category': categories['headphones-audio'], 'price': 34.99, 'stock': 20,
     'description': 'Portable 360° sound with 12-hour battery. IP67 waterproof, perfect for outdoor adventures. Built-in microphone.'},
    {'name': 'USB-C DAC Audio Adapter', 'slug': 'usb-c-dac-audio-adapter',
     'category': categories['headphones-audio'], 'price': 19.99, 'stock': 55,
     'description': 'Hi-Res audio DAC adapter supporting 32-bit/384kHz. Gold-plated 3.5mm jack for premium wired headphone experience.'},

    # Phone Holders
    {'name': 'Magnetic Car Mount Pro', 'slug': 'magnetic-car-mount-pro',
     'category': categories['phone-holders'], 'price': 22.99, 'stock': 40,
     'description': 'N52 neodymium magnets for ultra-strong hold. 360° rotation with one-hand operation. Dashboard and vent clip included.'},
    {'name': 'Adjustable Desk Stand', 'slug': 'adjustable-desk-stand',
     'category': categories['phone-holders'], 'price': 18.99, 'stock': 35,
     'description': 'Aluminum alloy desk stand with adjustable angle. Anti-slip silicone pads protect your phone. Foldable for portability.'},
    {'name': 'Ring Holder & Kickstand', 'slug': 'ring-holder-kickstand',
     'category': categories['phone-holders'], 'price': 7.99, 'stock': 3,
     'description': '360° rotating ring grip for secure one-handed use. Doubles as a kickstand for both portrait and landscape viewing.'},
]

for prod_data in products_data:
    Product.objects.create(**prod_data)
    print(f"  Created product: {prod_data['name']}")

print(f"\nDone! Created {Category.objects.count()} categories and {Product.objects.count()} products.")
