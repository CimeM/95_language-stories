import logging
from fastapi import HTTPException
from starlette.requests import Request
from firebase_admin import auth


def get_firebase_user(request: Request):
    id_token = request.headers.get('Authorization')
    if not id_token:
        raise HTTPException(status_code=400, detail='TokenID must be provided')

    try:
        claims = auth.verify_id_token(id_token)
        return claims
    except Exception as e:
        logging.exception(e)
        raise HTTPException(status_code=401, detail='Unauthorized')

def create_firebase_user(email: str, password: str):
    try:
        # Attempt to create the user
        user = auth.create_user(
            email=email,
            password=password
        )
        
        # Return a success response with user info
        return {
            "status": "success",
            "message": "User created successfully",
            "user": {
                "uid": user.uid,
                "email": user.email,
                # You can include other user info if needed
            }
        }

    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail='Email already exists')
    except Exception as e:
        logging.exception(e)
        raise HTTPException(status_code=500, detail='Error creating user')

def sign_in_firebase_user(email: str, password: str):
    try:
        user = auth.auth().sign_in_with_email_and_password(email, password)
        return user['idToken']
    except Exception as e:
        logging.exception(e)
        raise HTTPException(status_code=401, detail='Invalid credentials')

def verify_firebase_token(id_token: str):
    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token  # This contains user info including uid
    except Exception as e:
        logging.exception("Token verification failed")
        raise HTTPException(status_code=401, detail='Invalid token')