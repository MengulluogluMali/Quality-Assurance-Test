from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from config import Config
import stripe
import os

db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Init extensions
    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)

    # Stripe
    stripe.api_key = app.config['STRIPE_SECRET_KEY']

    # Login manager settings
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register blueprints
    from app.auth.routes import auth_bp
    from app.store.routes import store_bp
    from app.admin_panel.routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(store_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')

    # Create tables and seed data on first run
    with app.app_context():
        db.create_all()
        _seed_categories()

    return app


def _seed_categories():
    from app.models import Category
    categories = ['Cases & Covers', 'Chargers & Cables', 'Earphones & Headphones',
                  'Screen Protectors', 'Power Banks', 'Mounts & Holders', 'Other Accessories']
    for name in categories:
        if not Category.query.filter_by(name=name).first():
            db.session.add(Category(name=name))
    db.session.commit()
