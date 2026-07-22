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
    entries = db.relationship("Entry", back_populates="user", cascade="all, delete-orphan")

class EntryType(db.Model):
    __tablename__ = "entry_types"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(80), unique=True, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.datetime.now, nullable=False)

    # one type, many entries
    entries = db.relationship("Entry", back_populates="entry_type")

class Entry(db.Model):
    __tablename__ = "entries"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    type_id = db.Column(db.Integer, db.ForeignKey("entry_types.id"), nullable=False)

    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)

    icon = db.Column(db.String(255), nullable=True)

    entry_date = db.Column(db.DateTime, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.datetime.now, nullable=False)

    user = db.relationship("User", back_populates="entries")

    entry_type = db.relationship("EntryType", back_populates="entries")