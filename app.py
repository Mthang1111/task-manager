#Entry point for app

#docs: https://flask.palletsprojects.com/en/stable/
#docs: https://flask-sqlalchemy.readthedocs.io/en/stable/

import os
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

load_dotenv() # reads .env into the environment before anything else runs

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]

    CORS(app) #allow requests from different ports

    db.init_app(app)

    with app.app_context(): # run only this during actual user web request
        import models
        import routes
        routes.register_routes(app)
    

    @app.route("/") # 
    def hello_world():
        return "<p>Hello, World!</p>"
    return app

