from flask import (render_template, redirect, url_for, flash, request,
                   jsonify, current_app, abort)
from flask_login import login_required, current_user
from app.store import store_bp
from app.models import Product, Category, CartItem, Order, OrderItem
from app import db
import stripe


# ── HOME ──────────────────────────────────────────────────────────────────────

@store_bp.route('/')
def home():
    featured = Product.query.filter_by(is_featured=True, is_active=True).limit(8).all()
    categories = Category.query.all()
    new_arrivals = Product.query.filter_by(is_active=True).order_by(Product.created_at.desc()).limit(8).all()
    return render_template('store/home.html',
                           featured=featured,
                           categories=categories,
                           new_arrivals=new_arrivals)


# ── PRODUCT LISTING ───────────────────────────────────────────────────────────

@store_bp.route('/products')
def products():
    query = request.args.get('q', '').strip()
    category_id = request.args.get('category', type=int)
    sort = request.args.get('sort', 'newest')

    products_q = Product.query.filter_by(is_active=True)

    if query:
        products_q = products_q.filter(Product.name.ilike(f'%{query}%'))
    if category_id:
        products_q = products_q.filter_by(category_id=category_id)

    if sort == 'price_asc':
        products_q = products_q.order_by(Product.price.asc())
    elif sort == 'price_desc':
        products_q = products_q.order_by(Product.price.desc())
    else:
        products_q = products_q.order_by(Product.created_at.desc())

    page = request.args.get('page', 1, type=int)
    pagination = products_q.paginate(page=page, per_page=12, error_out=False)
    categories = Category.query.all()

    return render_template('store/products.html',
                           products=pagination.items,
                           pagination=pagination,
                           categories=categories,
                           current_category=category_id,
                           query=query,
                           sort=sort)


# ── PRODUCT DETAIL ────────────────────────────────────────────────────────────

@store_bp.route('/products/<int:product_id>')
def product_detail(product_id):
    product = Product.query.filter_by(id=product_id, is_active=True).first_or_404()
    related = Product.query.filter(
        Product.category_id == product.category_id,
        Product.id != product.id,
        Product.is_active == True
    ).limit(4).all()
    return render_template('store/product_detail.html', product=product, related=related)


# ── CART ──────────────────────────────────────────────────────────────────────

@store_bp.route('/cart')
@login_required
def cart():
    items = CartItem.query.filter_by(user_id=current_user.id).all()
    total = sum(item.subtotal for item in items)
    return render_template('store/cart.html', items=items, total=total)


@store_bp.route('/cart/add', methods=['POST'])
@login_required
def cart_add():
    product_id = request.form.get('product_id', type=int)
    quantity = request.form.get('quantity', 1, type=int)

    product = Product.query.filter_by(id=product_id, is_active=True).first()
    if not product:
        return jsonify({'success': False, 'message': 'Product not found.'}), 404
    if quantity < 1:
        return jsonify({'success': False, 'message': 'Invalid quantity.'}), 400
    if product.stock < quantity:
        return jsonify({'success': False, 'message': 'Not enough stock.'}), 400

    item = CartItem.query.filter_by(user_id=current_user.id, product_id=product_id).first()
    if item:
        new_qty = item.quantity + quantity
        if product.stock < new_qty:
            return jsonify({'success': False, 'message': 'Not enough stock.'}), 400
        item.quantity = new_qty
    else:
        item = CartItem(user_id=current_user.id, product_id=product_id, quantity=quantity)
        db.session.add(item)

    db.session.commit()
    cart_count = CartItem.query.filter_by(user_id=current_user.id).count()
    return jsonify({'success': True, 'message': f'Added {product.name} to cart!', 'cart_count': cart_count})


@store_bp.route('/cart/update', methods=['POST'])
@login_required
def cart_update():
    item_id = request.form.get('item_id', type=int)
    quantity = request.form.get('quantity', type=int)

    item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first()
    if not item:
        return jsonify({'success': False}), 404

    if quantity < 1:
        db.session.delete(item)
    else:
        if item.product.stock < quantity:
            return jsonify({'success': False, 'message': 'Not enough stock.'}), 400
        item.quantity = quantity

    db.session.commit()
    items = CartItem.query.filter_by(user_id=current_user.id).all()
    total = sum(i.subtotal for i in items)
    cart_count = len(items)
    return jsonify({
        'success': True,
        'subtotal': f'${item.subtotal:.2f}' if quantity >= 1 else '$0.00',
        'total': f'${total:.2f}',
        'cart_count': cart_count
    })


@store_bp.route('/cart/remove', methods=['POST'])
@login_required
def cart_remove():
    item_id = request.form.get('item_id', type=int)
    item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first()
    if item:
        db.session.delete(item)
        db.session.commit()

    items = CartItem.query.filter_by(user_id=current_user.id).all()
    total = sum(i.subtotal for i in items)
    cart_count = len(items)
    return jsonify({'success': True, 'total': f'${total:.2f}', 'cart_count': cart_count})


# ── CHECKOUT ──────────────────────────────────────────────────────────────────

@store_bp.route('/checkout')
@login_required
def checkout():
    items = CartItem.query.filter_by(user_id=current_user.id).all()
    if not items:
        flash('Your cart is empty.', 'warning')
        return redirect(url_for('store.cart'))
    total = sum(item.subtotal for item in items)
    stripe_public_key = current_app.config.get('STRIPE_PUBLIC_KEY', '')
    return render_template('store/checkout.html',
                           items=items,
                           total=total,
                           stripe_public_key=stripe_public_key)


@store_bp.route('/checkout/create-payment-intent', methods=['POST'])
@login_required
def create_payment_intent():
    items = CartItem.query.filter_by(user_id=current_user.id).all()
    if not items:
        return jsonify({'error': 'Cart is empty.'}), 400

    total = sum(item.subtotal for item in items)
    amount_cents = int(round(total * 100))

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='usd',
            metadata={
                'user_id': current_user.id,
                'user_email': current_user.email,
            }
        )
        return jsonify({'clientSecret': intent.client_secret})
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 400


@store_bp.route('/checkout/confirm', methods=['POST'])
@login_required
def checkout_confirm():
    """Called after Stripe confirms payment on the frontend."""
    payment_intent_id = request.form.get('payment_intent_id')
    shipping_name = request.form.get('shipping_name', '').strip()
    shipping_address = request.form.get('shipping_address', '').strip()
    shipping_city = request.form.get('shipping_city', '').strip()
    shipping_country = request.form.get('shipping_country', '').strip()

    if not all([payment_intent_id, shipping_name, shipping_address, shipping_city, shipping_country]):
        flash('Please fill in all shipping details.', 'danger')
        return redirect(url_for('store.checkout'))

    # Verify payment with Stripe
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        if intent.status != 'succeeded':
            flash('Payment was not completed. Please try again.', 'danger')
            return redirect(url_for('store.checkout'))
    except stripe.error.StripeError as e:
        flash(f'Payment verification failed: {e}', 'danger')
        return redirect(url_for('store.checkout'))

    # Prevent duplicate orders
    if Order.query.filter_by(stripe_payment_intent_id=payment_intent_id).first():
        flash('This order has already been processed.', 'info')
        return redirect(url_for('store.orders'))

    items = CartItem.query.filter_by(user_id=current_user.id).all()
    if not items:
        flash('Your cart is empty.', 'warning')
        return redirect(url_for('store.home'))

    total = sum(item.subtotal for item in items)

    order = Order(
        user_id=current_user.id,
        total=total,
        status='paid',
        stripe_payment_intent_id=payment_intent_id,
        shipping_name=shipping_name,
        shipping_address=shipping_address,
        shipping_city=shipping_city,
        shipping_country=shipping_country,
    )
    db.session.add(order)
    db.session.flush()

    for item in items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.product.price,
        )
        # Reduce stock
        item.product.stock = max(0, item.product.stock - item.quantity)
        db.session.add(order_item)
        db.session.delete(item)

    db.session.commit()

    # Send notifications
    from app.notifications import send_purchase_notification, send_order_confirmation
    send_purchase_notification(order)
    send_order_confirmation(order)

    flash('🎉 Order placed successfully! Check your email for confirmation.', 'success')
    return redirect(url_for('store.order_success', order_id=order.id))


@store_bp.route('/order/success/<int:order_id>')
@login_required
def order_success(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    return render_template('store/order_success.html', order=order)


@store_bp.route('/orders')
@login_required
def orders():
    user_orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    return render_template('store/orders.html', orders=user_orders)
