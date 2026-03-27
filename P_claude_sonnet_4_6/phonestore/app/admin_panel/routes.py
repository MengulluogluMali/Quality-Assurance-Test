import os
from functools import wraps
from flask import (render_template, redirect, url_for, flash, request,
                   current_app, abort)
from flask_login import login_required, current_user
from app.admin_panel import admin_bp
from app.models import Product, Category, Order, User
from app import db
from werkzeug.utils import secure_filename
from PIL import Image


def admin_required(f):
    @wraps(f)
    @login_required
    def decorated(*args, **kwargs):
        if not current_user.is_admin:
            abort(403)
        return f(*args, **kwargs)
    return decorated


def allowed_file(filename):
    return ('.' in filename and
            filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS'])


def save_image(file):
    filename = secure_filename(file.filename)
    # Add unique prefix to avoid collisions
    import uuid
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_name)
    img = Image.open(file)
    img.thumbnail((800, 800))
    img.save(path)
    return unique_name


# ── DASHBOARD ─────────────────────────────────────────────────────────────────

@admin_bp.route('/')
@admin_required
def dashboard():
    total_products = Product.query.filter_by(is_active=True).count()
    total_orders = Order.query.count()
    total_revenue = db.session.query(db.func.sum(Order.total)).filter_by(status='paid').scalar() or 0
    total_users = User.query.count()
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()
    low_stock = Product.query.filter(Product.stock <= 5, Product.is_active == True).all()
    return render_template('admin/dashboard.html',
                           total_products=total_products,
                           total_orders=total_orders,
                           total_revenue=total_revenue,
                           total_users=total_users,
                           recent_orders=recent_orders,
                           low_stock=low_stock)


# ── PRODUCTS ──────────────────────────────────────────────────────────────────

@admin_bp.route('/products')
@admin_required
def products():
    all_products = Product.query.order_by(Product.created_at.desc()).all()
    return render_template('admin/products.html', products=all_products)


@admin_bp.route('/products/add', methods=['GET', 'POST'])
@admin_required
def add_product():
    categories = Category.query.all()
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        description = request.form.get('description', '').strip()
        price = request.form.get('price', type=float)
        stock = request.form.get('stock', 0, type=int)
        category_id = request.form.get('category_id', type=int)
        is_featured = request.form.get('is_featured') == 'on'

        if not name or not description or price is None:
            flash('Name, description, and price are required.', 'danger')
            return render_template('admin/add_product.html', categories=categories)

        image_filename = 'default_product.png'
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                image_filename = save_image(file)

        product = Product(
            name=name,
            description=description,
            price=price,
            stock=stock,
            category_id=category_id,
            is_featured=is_featured,
            image_filename=image_filename,
        )
        db.session.add(product)
        db.session.commit()
        flash(f'Product "{name}" added successfully!', 'success')
        return redirect(url_for('admin.products'))

    return render_template('admin/add_product.html', categories=categories)


@admin_bp.route('/products/edit/<int:product_id>', methods=['GET', 'POST'])
@admin_required
def edit_product(product_id):
    product = Product.query.get_or_404(product_id)
    categories = Category.query.all()

    if request.method == 'POST':
        product.name = request.form.get('name', '').strip()
        product.description = request.form.get('description', '').strip()
        product.price = request.form.get('price', type=float)
        product.stock = request.form.get('stock', 0, type=int)
        product.category_id = request.form.get('category_id', type=int)
        product.is_featured = request.form.get('is_featured') == 'on'
        product.is_active = request.form.get('is_active') == 'on'

        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                product.image_filename = save_image(file)

        db.session.commit()
        flash(f'Product "{product.name}" updated!', 'success')
        return redirect(url_for('admin.products'))

    return render_template('admin/edit_product.html', product=product, categories=categories)


@admin_bp.route('/products/delete/<int:product_id>', methods=['POST'])
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_active = False  # Soft delete to preserve order history
    db.session.commit()
    flash(f'Product "{product.name}" removed.', 'success')
    return redirect(url_for('admin.products'))


# ── ORDERS ────────────────────────────────────────────────────────────────────

@admin_bp.route('/orders')
@admin_required
def orders():
    status_filter = request.args.get('status', '')
    orders_q = Order.query.order_by(Order.created_at.desc())
    if status_filter:
        orders_q = orders_q.filter_by(status=status_filter)
    all_orders = orders_q.all()
    return render_template('admin/orders.html', orders=all_orders, status_filter=status_filter)


@admin_bp.route('/orders/<int:order_id>/status', methods=['POST'])
@admin_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    new_status = request.form.get('status')
    if new_status in ('pending', 'paid', 'shipped', 'cancelled'):
        order.status = new_status
        db.session.commit()
        flash(f'Order #{order.id} updated to {new_status}.', 'success')
    return redirect(url_for('admin.orders'))


# ── MAKE ADMIN ────────────────────────────────────────────────────────────────

@admin_bp.route('/make-admin/<int:user_id>', methods=['POST'])
@admin_required
def make_admin(user_id):
    user = User.query.get_or_404(user_id)
    user.is_admin = True
    db.session.commit()
    flash(f'{user.email} is now an admin.', 'success')
    return redirect(url_for('admin.dashboard'))
