from flask_sqlalchemy import SQLAlchemy
import datetime

from sqlalchemy import func

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    password_hash = db.Column(db.String(255), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.datetime.now, nullable=False)

    # One user, many outfits
    outfits = db.relationship("Outfit", back_populates="user", cascade="all, delete-orphan")


class Outfit(db.Model):
    __tablename__ = "outfits"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # name = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)

    icon = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, nullable=False)

    user = db.relationship("User", back_populates="outfits")