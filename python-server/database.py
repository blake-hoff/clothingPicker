from flask_sqlalchemy import SQLAlchemy
import datetime

from sqlalchemy import Boolean, func

db = SQLAlchemy()

# Outfits Table
class Outfit(db.Model):
    __tablename__ = "outfits"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)

    icon = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime(),server_default=func.now(),nullable=False)

