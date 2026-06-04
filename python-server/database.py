from flask_sqlalchemy import SQLAlchemy
import datetime

from sqlalchemy import Boolean, func

db = SQLAlchemy()

# Outfits Table
class Outfit(db.Model):
    __tablename__ = "outfits"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)

    icon = db.Column(db.String(255), nullable=True)

    
    created_at = db.Column(db.DateTime(), 
                           server_default=func.now(),
                           nullable=False)
    
    # created at is for the actual time created for tracking purposes. 
    # the entry date is for the calendar date entry on frontend sorting and uses a simpler format.
    entry_date = db.Column(db.Date, nullable=False) # format is year-month-day (2026-06-04)

