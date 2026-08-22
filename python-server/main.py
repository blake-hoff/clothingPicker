from datetime import date, datetime

import logging
import requests

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_migrate import Migrate

from database import db, Entry, EntryType, User
from functions import invalidUserParamaters, validText
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
from datetime import timedelta
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# Load variables from .env file into environment
load_dotenv(verbose=True)

logger = logging.getLogger(__name__) # for error logging

app = Flask(__name__)
app.config.update(SESSION_COOKIE_SAMESITE='None', SESSION_COOKIE_SECURE=True)
app.config["JWT_SECRET_KEY"] = os.environ.get('FLASK_SECRET_KEY')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)
jwt = JWTManager(app)
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "https://blake-hoff.github.io"])  # Enables CORS to allow requests from the React frontend
print(app.url_map)

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
@jwt_required(optional=False)
def get_all_items():
    # Get all entries in the database
    token_user_id = get_jwt_identity()
    userID = int(token_user_id)

    if userID is None:
        return jsonify({
            'success': False,
            "error": "Unauthorized user."
        }), 401

    items = Entry.query.filter_by(user_id=userID).order_by(Entry.entry_date.desc())

    return jsonify({
        'success': True,
        'items': [{'id': item.id,
                   'type_id': item.type_id,
                    'name':item.name,
                    'icon':item.icon,
                    'date': item.entry_date,
                    'created_at': item.created_at,
                    'description': item.description
                    } for item in items],
        'date': date.today() # extra info for frontend to know the date from the server.
    }), 200

# Create an entry
@app.route('/api/create/', methods=['POST'])
@jwt_required(optional=False)
def create_entry():
    token_user_id = get_jwt_identity()
    userID = int(token_user_id)

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

    if not validText(usersDesc):
        return jsonify({
            'success': False,
            "message": "Invalid entry description."
        }), 400

    if not userDate:
        return jsonify({
            'success': False,
            "message": "Invalid entry date."
        }), 400
    
    userDateAsDT = datetime.fromisoformat(userDate) # convert the string given by user (in iso format) to a python datetime object
    usersEntryName = data.get("entry_name")

    ## ---------- Type Information ---------- ##
    usersTypeName = data.get("type_name") # get users type name from payload    
    # retrieve the entry if an entry has been created for the given date from the user.
    # the submitted type name will always be unique as per the db schema, and the create endpoint.
    query_type = EntryType.query.filter_by(name=usersTypeName).first()

    selectedTypeID = query_type.id # will be unique 
    selectedTypeName = query_type.name
    selectedTypeMax = query_type.max_per_day
    print(selectedTypeMax)

    entryName = ''
    # if the user submitted entry name:
    #  is blank or contains less than three text characters in it.
    #  or
    #  contains the type name,
    #  set the entry name to the type name.
    if not validText(usersEntryName) or (usersTypeName.lower() in usersEntryName.lower()):
        entryName = usersTypeName
    else: # only use the users submitted name if it is valid and the type name does not exist in it.
        entryName = usersEntryName

    
    # retrieve the database entries matching:
    #  usersId,
    #  entry date,
    #  type
    # get the length of this entry list called entry_list_length
    # if entry_list_length > selectedTypeMax, do not allow an entry to be created, since the max entries have been created for today, for this type, for this user.
    # otherwise, allow an entry to be created.
    entry_list = Entry.query.filter_by(user_id=userID, entry_date=userDateAsDT, type_id=selectedTypeID).all()
    entry_list_length = len(entry_list)
    print(entry_list)
    print(entry_list_length)

    if entry_list_length < selectedTypeMax:
        print(f'date time today {date.today()}')
        print(f'date time payload {userDate} {type(userDate)}')
        print(f'date time converted {userDateAsDT}')

        entry = Entry(description=usersDesc,
                        icon='https://images.unsplash.com/vector-1775556825284-3b697bc284bf?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0',
                        entry_date=userDateAsDT,
                        user_id=userID,
                        type_id=selectedTypeID,
                        name=entryName
                       )
        db.session.add(entry)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Created new entry because an entry did not exist for date {userDate}.'
        }), 200
    
    else: # too many entries for this day.
        return jsonify({
            'success': False,
            'message': f'Could not create a new entry because the max entries has been reached.'
        }), 200

# Update an entry
@app.route('/api/update/<int:entry_id>', methods=['POST'])
@jwt_required(optional=False)
def update_entry(entry_id):
    token_user_id = get_jwt_identity()
    userID = int(token_user_id)
    
    data = request.get_json() # data sent from the user frontend

    if not data:
        return jsonify({
            'success': False,
            "error": "Missing JSON payload"
        }), 400

    if not userID:
        return jsonify({
            'success': False,
            "error": "Missing authentication. Must be logged in to complete this action."
        }), 400

    ## ---------- Entry Information ---------- ##
    usersDesc = data.get("description") # get user description from payload
    userDate = data.get("date") # get user date from payload
    userDateAsDT = ''
    try:
        userDateAsDT = datetime.fromisoformat(userDate) # convert the string given by user (in iso format) to a python datetime object
    except:
        return jsonify({
            'success': False,
            "error": f"Date out of range."
        }), 400

    usersEntryName = data.get("entry_name")

    ## ---------- Type Information ---------- ##
    usersTypeName = data.get("type_name") # get users type name from payload
    # the submitted type name will always be unique as per the db schema, and the create endpoint.
    query_type = EntryType.query.filter_by(name=usersTypeName).first()
    if not query_type:
        return jsonify({
            'success': False,
            "error": f"Could not find a type with name: {usersTypeName}."
        }), 400

    selectedTypeID = query_type.id

    entryName = ''
    # if the user submitted entry name:
    #  is blank or contains less than three text characters in it.
    #  or
    #  contains the type name,
    #  set the entry name to the type name.
    if not (usersEntryName) or (usersTypeName.lower() in usersEntryName.lower()):
        entryName = usersTypeName
    else: # only use the users submitted name if it is valid and the type name does not exist in it.
        entryName = usersEntryName
    
    # retrieve the database entry with the exact same primary ID
    selected_entry = Entry.query.filter_by(id=entry_id).first()
    print(selected_entry)

    # if the entry was found by the primary ID
    if selected_entry:
        selected_entry.name = entryName
        selected_entry.description = usersDesc
        selected_entry.entry_date = userDateAsDT
        selected_entry.type_id = selectedTypeID

        db.session.add(selected_entry)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Updated entry.'
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': f'An entryType with name {usersTypeName} did not exist.'
        }), 400

@app.route('/api/item/<int:entry_id>', methods=['DELETE'])
@jwt_required(optional=False)
def delete_entry(entry_id):
    token_user_id = get_jwt_identity()
    userID = int(token_user_id)

    # see if it is in the backends database already.
    outfitEntry = Entry.query.filter_by(id=entry_id).first()

    # the user id of the database entry must match the session user id.
    outfitUserID = outfitEntry.user_id


    if outfitUserID != userID: # do not allow a malicious user to delete someone elses entry.
        return jsonify({
            'success': False,
            'message': f'You cannot delete someone elses entry.'
        }), 401

    # if it is not in the database, return client side error.
    if not outfitEntry:
        return jsonify({
            'success': False,
            'message': f'Item with id \"{entry_id}\" not found'
        }), 404
    
    # use a try statement for a database operation that could fail.
    try:
        # delete the entry in the database by setting every value to null
        db.session.delete(outfitEntry)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Deleted entry succcessfully.'
            }), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Could not delete item {entry_id}: {str(e)}") # log error

## ---------- Type APIs ---------- ##
# Get all rows of types
@app.route('/api/types/', methods=['GET'])
@jwt_required(optional=False)
def get_all_types():
    token_user_id = get_jwt_identity()
    userID = int(token_user_id)

    if userID is None:
        return jsonify({
            'success': False,
            "error": "Unauthorized user."
        }), 401

    types = EntryType.query    

    return jsonify({
        'success': True,
        'items': [{'name': type.name, # (db indexes start at 1, there is no zero element.)
                    'created_at': type.created_at
                    } for type in types],
        'date': date.today() # extra info for frontend to know the date from the server.
    }), 200

# Create an entry in the type table
@app.route('/api/types/create/', methods=['POST'])
@jwt_required(optional=False)
def create_entry_type():
    token_user_id = get_jwt_identity()
    userID = int(token_user_id)

    data = request.get_json() # data sent from the user frontend
    # print(data)
    if not data:
        return jsonify({
            'success': False,
            "error": "Missing JSON payload"
        }), 400
        
    usersTypeName = data.get("name") # get users type name from payload
    
    # retrieve the entry if an entry has been created for the given date from the user.
    query_type = EntryType.query.filter_by(name=usersTypeName).first()

    # if the type already exists
    if query_type:
        return jsonify({
            'success': False,
            'message': f'Entry type already exists with name {usersTypeName}.'
        }), 200

    else: # add to database
        entry = EntryType(name=usersTypeName, max_per_day=3)
        db.session.add(entry)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Created new entryType because one did not exist with name {usersTypeName}.'
        }), 200

# Update an entry in the type table
@app.route('/api/types/update/', methods=['POST'])
@jwt_required(optional=False)
def update_entry_type():
    token_user_id = get_jwt_identity()
    userID = int(token_user_id)

    data = request.get_json() # data sent from the user frontend
    
    if not data:
        return jsonify({
            'success': False,
            "error": "Missing JSON payload"
        }), 400
        
    usersTypeName = data.get("name") # get users type name from payload
    usersTypeID = data.get("type_id")
    
    # retrieve the entry if an entry has been created for the given date from the user.
    query_type = EntryType.query.filter_by(id=usersTypeID).first()

    # if the type already exists, must update with new information
    if query_type and query_type.name != usersTypeName:
        query_type.name = usersTypeName
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Updated TntryType name because an EntryType did exist with name {usersTypeName}.'
        }), 200

    else:     # if it is not in the database return an error.
        return jsonify({
            'success': False,
            'message': f'The entryType at ID {usersTypeID} is already named {usersTypeName}.'
        }), 200

# Update an entry in the type table
@app.route('/api/types/delete/', methods=['DELETE'])
@jwt_required(optional=False)
def delete_entry_type():
    token_user_id = get_jwt_identity()
    userID = int(token_user_id)

    data = request.get_json() # data sent from the user frontend

    if not data:
        return jsonify({
            'success': False,
            "error": "Missing JSON payload"
        }), 400
    
    usersTypeID = data.get("type_id")
    
    # retrieve the entry if an entry has been created for the given date from the user.
    query_type = EntryType.query.filter_by(id=usersTypeID).first()

    # if it is not in the database, return client side error.
    if not query_type:
        return jsonify({
            'success': False,
            'message': f'Item with id \"{usersTypeID}\" not found'
        }), 404
    
    # use a try statement for a database operation that could fail.
    try:
        # attempt to delete the entry in the database 
        db.session.delete(query_type)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Deleted entry succcessfully.'
            }), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Could not delete item {usersTypeID}: {str(e)}") # log error

# ---------- Authentication Routes ----------
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
        }), 202
    
    if email_db:
        return jsonify({
            'success': False,
            'message': f'The email \'{userEmail}\' is taken.'
        }), 202


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
    # otherwise, log in to an account with the received user parameters

    data = request.get_json() # data sent from the user frontend
    print(data)
    
    if not data:
        return jsonify({
            'success': False,
            "error": "Missing JSON payload"
            }), 400

    
    userName = data.get("username")
    userPassword = data.get("password")

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
        isValidPassword = check_password_hash(username_db.password_hash, userPassword)
        if isValidPassword:
            access_token = create_access_token(identity=str(username_db.id))

            return jsonify({
                'success': True,
                'message': f'The account with username \'{userName}\' was found and the password is correct.',
                'token': access_token
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'The account with username \'{userName}\' was found and the password is incorrect.'
            }), 400

    # if the username is not in the database send error to the user.
    else:
        return jsonify({
            'success': False,
            'message': f'An account with the username \'{userName}\' does not exist.'
        }), 400

@app.route("/api/auth/logout/", methods=["POST"])
def logout():
    return jsonify({
        "success": True,
        "message": "Logged out."
    }), 200

# for any request with invalid tokens in the headers, send 401.
@jwt.invalid_token_loader
def my_invalid_token_callback(error_string):
    return jsonify({
        "logged_in": False,
        "error": "Invalid token provided.",
        "details": error_string
    }), 401

# for any request with no token in the header, send 200.
@jwt.unauthorized_loader
def my_unauthorized_callback(error_string):
    return jsonify({
        "logged_in": False,
        "error": "Missing authorization header.",
        "details": error_string
    }), 200

@app.route("/api/auth/user/")
@jwt_required(optional=True)
def user():
    user_id = get_jwt_identity()

    if user_id is None:
        print('not logged in')
        return jsonify({
            "logged_in": False,
            "error": "No authentication provided."
            }), 200

    user = User.query.get(int(user_id))

    if not user:
        return jsonify({
            "logged_in": False,
            "error": "No user found."
            }), 200
    
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