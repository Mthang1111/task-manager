# creates all tables from the SQLAlchemy models
# you only need to run this script once after configuring .env, before starting the app with run.py.

from app import create_app, db
import models  # import needed to ensure all tables are imported

app = create_app()

with app.app_context():
    db.create_all()
    print("Tables created.")