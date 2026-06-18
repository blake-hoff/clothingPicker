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

# populate database for missing days in the database
@app.route('/api/populate/', methods=['POST'])
def populate_db():
    print('populate db')
    # see if an entry has been created for today
    # isEntryToday = lookupTodayEntry(Outfit)

    data = request.get_json() # data sent from the user frontend
    print(data)
    
    if not data:
        return jsonify({"error": "Missing JSON payload"}), 400
        
    usersDesc = data.get("description")

    # if it is not in the database we need to add it.
    # add to database
    entry = Outfit(description=usersDesc,
                    icon='https://images.unsplash.com/vector-1775556825284-3b697bc284bf?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0',
                    # date.
                    )
    db.session.add(entry)
    db.session.commit()
    print('cannot add outfit for a day that already exists')

    # user_data = {
    #     "id": Outfit.id,
    #     "name": Outfit.name,
    #     "description": Outfit.description,
    #     "time-created": Outfit.created_at,
    #     "icon": Outfit.icon
    # }

    return jsonify({
        'success': True,
        'item': usersDesc
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
        'date': datetime.date.today() # extra info for frontend to know the date from the server.
    }), 200

# Create an entry in the database
@app.route('/api/create/', methods=['POST'])
def create_outfit():
    print('create_outfit')
    # see if an entry has been created for the given date from the user.
    # if the entry already exists, should be updated with the new version
    # isEntryToday = lookupTodayEntry(Outfit)
    # isEntryToday = False

    data = request.get_json() # data sent from the user frontend
    print(data)
    
    if not data:
        return jsonify({"error": "Missing JSON payload"}), 400
        
    usersDesc = data.get("description") # get user description from payload
    userDate = data.get("date") # get user date from payload
    userDateAsDT = datetime.datetime.fromisoformat(userDate)
    # convert the string given by user (in iso format) to a python datetime object

    # if it is not in the database we need to add it.
    if not isEntryToday:
        print(f'date time today {datetime.date.today()}')
        print(f'date time payload {userDate} {type(userDate)}')
        print(f'date time converted {userDateAsDT}')
      # add to database
        entry = Outfit(name='User',
                        description=usersDesc,
                        icon='https://images.unsplash.com/vector-1775556825284-3b697bc284bf?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0',
                        entry_date=userDateAsDT,
                        created_at=userDateAsDT
                       )
        db.session.add(entry)
        db.session.commit()
    else:
        # print('cannot add outfit for a day that already exists')
        return jsonify({
        'success': False,
        'message': 'Cannot add an outfit for a day that already exists.'
    }), 403

    # user_data = {
    #     "id": Outfit.id,
    #     "name": Outfit.name,
    #     "description": Outfit.description,
    #     "time-created": Outfit.created_at,
    #     "icon": Outfit.icon
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