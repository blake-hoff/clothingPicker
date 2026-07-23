import pytest
from main import app
import os
from dotenv import load_dotenv

# run this in the venv
# then run with 'pytest test.py' -s
# the -s shows every print statement too.

# Load variables from .env file into environment
load_dotenv(verbose=True)
test_username = os.environ.get('TEST_USER_NAME')
test_password = os.environ.get('TEST_USER_PASSWORD')
test_email = os.environ.get('TEST_USER_EMAIL')

@pytest.fixture
def client():
    app.config['TESTING'] = True # for more test/debug info.
    with app.test_client() as client:
        yield client


# use auth_client as an object for other tests.
# will login using fixed credentials, yield for the tests, then log out once the tests complete.
@pytest.fixture
def auth_client(client):
    # test login on a user that I know exists.
    # this may be changed later to 'inject' a new user for testing purposes, to remain the same on ANY db file online or offline.
    # for now, this works for a local system with both the local-only database.db and authentication files.
    client.post('/api/auth/login/', json={"username": test_username, "password": test_password})
    
    yield client
    
    # log out after the test is done
    client.post('/api/auth/logout/')


def test_signup_endpoint(client):
    # test signup on a user that I know exists, while not logged in.
    response = client.post('/api/auth/signup/', json={"email": test_email, "username": test_username, "password": test_password})
    print('test signup')
    print(response.json)
    
    assert response.status_code == 202
    assert response.json['success'] == False
        
    # log out after the test is done
    client.post('/api/auth/logout')


def test_get_endpoint_valid(auth_client):
    response = auth_client.get('/api/types/')
    print('types')
    print(response.json)
    assert response.status_code == 200
    assert response.json["success"] == True

def test_get_endpoint_invalid(client):
    response = client.get('/api/types/')
    # print(response)
    assert response.status_code == 401
    assert response.json["success"] == False
