from datetime import date, datetime

import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import db, Outfit
import requests
from functions import *
from flask_migrate import Migrate

logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enables CORS to allow requests from the React frontend

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

migrate = Migrate(app, db)

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
    items = Outfit.query.order_by(Outfit.created_at.desc())
    # print(items)

    #this can use flask login which is not set up yet.
    # user_items = UserItem.query.filter_by(user_id=current_user.id).all()
    # for ui in user_items:
    #     print(ui.item.name, ui.item.description)

    return jsonify({
        'success': True,
        'items': [{'name':'tempName', 
                   'id': item.id,
                    'icon':item.icon,
                    'date': item.created_at,
                    # 'entry_date':item.entry_date,
                    'description': item.description
                    } for item in items],
        'date': date.today() # extra info for frontend to know the date from the server.
    }), 200

# Create an entry in the database
@app.route('/api/create/', methods=['POST'])
def create_outfit():
    print('create_outfit')

    # 1. ensure the request is safe to read from,
    # read the request, split up the values into variables here.
    

    data = request.get_json() # data sent from the user frontend
    print(data)
    
    if not data:
        return jsonify({"error": "Missing JSON payload"}), 400
        
    usersDesc = data.get("description") # get user description from payload
    userDate = data.get("date") # get user date from payload
    userDateAsDT = datetime.fromisoformat(userDate)
    # convert the string given by user (in iso format) to a python datetime object
    
    # retrieve the entry if an entry has been created for the given date from the user.    
    old_entry = Outfit.query.filter_by(created_at=userDateAsDT).first()

    # if the entry already exists, should be updated with the new version
    if old_entry:
        old_entry.description = usersDesc
        db.session.commit()

        # print(old_entry.id)
        return jsonify({
            'success': True,
            'message': f'Updated entry description because an entry did exist for date {userDate}.'
        }), 200


    # if it is not in the database it can be added simply.
    else:
        print(f'date time today {date.today()}')
        print(f'date time payload {userDate} {type(userDate)}')
        print(f'date time converted {userDateAsDT}')
        # add to database
        entry = Outfit(name='User',
                        description=usersDesc,
                        icon='https://images.unsplash.com/vector-1775556825284-3b697bc284bf?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0',
                        created_at=userDateAsDT
                       )
        db.session.add(entry)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Created new entry because an entry did not exist for date {userDate}.'
        }), 200
    # else:
    #     print('cannot add outfit for a day that already exists')
    #     return jsonify({
    #         'success': False,
    #         'message': 'Cannot add an outfit for a day that already exists.'
    #     }), 403



@app.route('/api/item/<int:item_id>', methods=['DELETE'])
def delete_entry(item_id):
    # see if it is in the backends database already.
    outfitEntry = Outfit.query.filter_by(id=item_id).first()

    # if it is not in the database, return client side error.
    if not outfitEntry:
        return jsonify({
            'success': False,
            'error': f'Item with id \"{item_id}\" not found'
        }), 404
    
    # use a try statement for a database operation that could fail.
    try:
        # attempt to delete the entry in the database 
        db.session.delete(outfitEntry)
        db.session.commit()

        return jsonify({'success': True,}), 200 # if the code got here, it means that the entry has been successfully deleted
    except Exception as e:
        db.session.rollback()
        logger.error(f"Could not delete item {item_id}: {str(e)}") # log error

# For direct execution
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)