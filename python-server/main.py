from datetime import date, datetime

import logging
import requests

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_migrate import Migrate

from database import db, Outfit, User
from functions import invalidUserParamaters
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv

# Load variables from .env file into environment
load_dotenv(verbose=True)

logger = logging.getLogger(__name__) # for error logging

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY')
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])  # Enables CORS to allow requests from the React frontend

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
    userID = session.get("user_id")

    if userID is None:
        return jsonify({
            'success': False,
            "error": "Unauthorized user."
        }), 401


    items = Outfit.query.filter_by(user_id=userID).order_by(Outfit.created_at.desc())
    # need to filter by the user id based on the users credentials later on.
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
        return jsonify({
            'success': False,
            "error": "Missing JSON payload"
        }), 400
        
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
        entry = Outfit(description=usersDesc,
                        icon='https://images.unsplash.com/vector-1775556825284-3b697bc284bf?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0',
                        created_at=userDateAsDT,
                        user_id=get_user_identity()
                       )
        db.session.add(entry)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Created new entry because an entry did not exist for date {userDate}.'
        }), 200



@app.route('/api/item/<int:item_id>', methods=['DELETE'])
def delete_entry(item_id):
    # see if it is in the backends database already.
    outfitEntry = Outfit.query.filter_by(id=item_id).first()

    # if it is not in the database, return client side error.
    if not outfitEntry:
        return jsonify({
            'success': False,
            'message': f'Item with id \"{item_id}\" not found'
        }), 404
    
    # use a try statement for a database operation that could fail.
    try:
        # attempt to delete the entry in the database 
        db.session.delete(outfitEntry)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Deleted entry succcessfully.'
            }), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Could not delete item {item_id}: {str(e)}") # log error



@app.route('/api/auth/signup/', methods=['POST'])
def sign_up():
    # 1. ensure the request is safe to read from,
    # read the request, split up the values into variables here.
    # if the parameters are invalid, return corresponding error
    # if the username or email exist, return corresponding error
    # otherwise, make an account with the received user parameters

    data = request.get_json() # data sent from the user frontend
    print(data)
    
    if not data:
        return jsonify({
            'success': False,
            "message": "Missing JSON payload"
            }), 400

    userName = data.get("username")
    userEmail = data.get("email") # get user email from payload
    userPassword = data.get("password") # get user password from payload
    # print(userName, userEmail, userPassword)
    
    invalidParameters, parametersMessage = invalidUserParamaters(username=userName, email=userEmail, password=userPassword)
    if(invalidParameters):
        return jsonify({
            'success': False,
            'message': f'The parameters used are invalid. {parametersMessage}'
        }), 400

    # retrieve the entry if an entry has been created for the chosen username from the user.
    username_db = User.query.filter_by(username=userName).first() 
    email_db = User.query.filter_by(email=userEmail).first()
    # user could not reuse an username or email

    # if the username already exists, should not create an account. need to send an error message.
    if username_db:
        return jsonify({
            'success': False,
            'message': f'The username \'{userName}\' is taken.'
        }), 400
    
    if email_db:
        return jsonify({
            'success': False,
            'message': f'The email \'{userEmail}\' is taken.'
        }), 400


    # if the username is not in the database it can be added.
    else:
        passwordHash = generate_password_hash(userPassword) # generate the password hash for use in the database. 
        # add to database
        new_user = User(username=userName,
                    email=userEmail,
                    password_hash=passwordHash
                    )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Created new user because an account with the username \'{userName}\' did not exist yet.'
        }), 200



@app.route('/api/auth/login/', methods=['POST'])
def log_in():
    # 1. ensure the request is safe to read from,
    # read the request, split up the values into variables here.
    # if the parameters are invalid, return corresponding error
    # if the username exist, return corresponding error
    # otherwise, make an account with the received user parameters

    data = request.get_json() # data sent from the user frontend
    print(data)
    
    if not data:
        return jsonify({
            'success': False,
            "error": "Missing JSON payload"
            }), 400

    
    userName = data.get("username")
    # userEmail = data.get("email") # get user email from payload
    userPassword = data.get("password") # get user password from payload
    # print(userName, userPassword)

    invalidParameters, parametersMessage = invalidUserParamaters(username=userName, password=userPassword)
    if(invalidParameters):
        return jsonify({
            'success': False,
            'message': f'The parameters used are invalid. {parametersMessage}'
        }), 400

    # retrieve the entry object if an entry has been created for the chosen username from the user.
    username_db = User.query.filter_by(username=userName).first() 

    # if the username exists, need to validate the password.
    if username_db:
        # used for changing the password.
        # new_hash = generate_password_hash(userPassword)
        # username_db.password_hash = new_hash
        # db.session.commit()
    
        isValidPassword = check_password_hash(username_db.password_hash, userPassword)
        if isValidPassword:
            session.permanent = True
            session["user_id"] = username_db.id
            return jsonify({
                'success': True,
                'message': f'The account with username \'{userName}\' was found and the password is correct.'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'The username \'{userName}\' is taken and the password is incorrect.'
            }), 400

    # if the username is not in the database send error to the user.
    else:
        return jsonify({
            'success': False,
            'message': f'An account with the username \'{userName}\' does not exist.'
        }), 400

@app.route("/api/auth/logout/", methods=["POST"])
def logout():
    print('hello world')
    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out."
    }), 200

@app.route("/api/auth/user/")
def user():
    user_id = session.get("user_id")

    if user_id is None:
        print('not logged in')
        return jsonify({
            "logged_in": False
        }), 200

    user = User.query.get(user_id)

    return jsonify({
        "logged_in": True,
        "id": user.id,
        "username": user.username
    }), 200

# For direct execution
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)