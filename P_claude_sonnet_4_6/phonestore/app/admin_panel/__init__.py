from flask import Blueprint
admin_bp = Blueprint('admin', __name__)
from app.admin_panel import routes  # noqa
