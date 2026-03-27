"""
One-time setup script: creates the .env file and promotes the first user to admin.
Run ONCE after first registering your account:
    python setup_admin.py your@email.com
"""
import sys
import os

# Create .env from example if it doesn't exist
if not os.path.exists('.env'):
    if os.path.exists('.env.example'):
        import shutil
        shutil.copy('.env.example', '.env')
        print("✅ Created .env from .env.example — please edit it with your real values!")
    else:
        print("⚠️  No .env.example found. Create a .env file manually.")

from app import create_app, db
from app.models import User

app = create_app()

email = sys.argv[1] if len(sys.argv) > 1 else None

with app.app_context():
    if email:
        user = User.query.filter_by(email=email.lower()).first()
        if user:
            user.is_admin = True
            db.session.commit()
            print(f"✅ {user.name} ({user.email}) is now an admin!")
        else:
            print(f"❌ No user found with email: {email}")
            print("   Register first at http://localhost:5000/auth/register")
    else:
        print("Usage: python setup_admin.py your@email.com")
        users = User.query.all()
        if users:
            print(f"\nRegistered users:")
            for u in users:
                print(f"  {'[ADMIN]' if u.is_admin else '       '} {u.email}")
