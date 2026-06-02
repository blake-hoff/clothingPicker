import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from database import db, Outfit
import requests
from functions import *

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enables CORS to allow requests from the React frontend

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Class Routes
#base page
@app.route('/')
def base_page():
    return jsonify({
        'success': True,
    }), 200

# Get all entries
@app.route('/api/view/', methods=['GET'])
def get_all_items():
    # Get all entries in the database
    items = Item.query.all()

    #this can use flask login which is not set up yet.
    # user_items = UserItem.query.filter_by(user_id=current_user.id).all()
    # for ui in user_items:
    #     print(ui.item.name, ui.item.description)

    return jsonify({
        'success': True,
        'items': [{'date': item.created_at, 'description': item.description} for item in items]
    }), 200

# Create an entry in the database
@app.route('/api/create/', methods=['POST'])
def get_item_details():
    print('hi')
    # see if an entry has been created for today
    # isEntryToday = lookupTodayEntry(Outfit)
    # Item.query.sort_by(created_at).first()

    data = request.get_json()
    print(data)
    
    if not data:
        return jsonify({"error": "Missing JSON payload"}), 400
        
    usersDesc = data.get("description")

    # if it is not in the database we need to add it.
    # if not item:
    #     # add to database
    #     entry = Outfit(description=payloadDesc)
    #     db.session.add(entry)
    #     db.session.commit()

    # item_data = {
    #     "id": item.roblox_item_id,
    #     "name": item.name,
    #     "description": item.description,
    #     "quantity": item.quantity,
    #     "time-created": item.created_at,
    #     "icon": item.icon
    # }

    return jsonify({
        'success': True,
        'item': usersDesc
    }), 200


# For direct execution
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)