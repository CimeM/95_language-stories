import logging
from fastapi import APIRouter, Depends, HTTPException
from app.services.firebase import get_firebase_user, create_firebase_user, verify_firebase_token
from pydantic import BaseModel

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

simple_router = APIRouter()

class UserSignup(BaseModel):
    username: str
    password: str

@simple_router.get('/firebase_user')
async def firebase_user(
    user = Depends(get_firebase_user)
):
    """Test endpoint that depends on authenticated Firebase user."""
    logger.info("Fetching Firebase user: %s", user['username'])
    return user

@simple_router.post("/signup")
async def signup(user: UserSignup):
    """Sign up a new user and return a token."""
    logger.info("Signing up user with username: %s", user.username)
    
    try:
        token = create_firebase_user(user.username, user.password)
        logger.info("User signed up successfully: %s", user.username)
        return {"token": token}
    except Exception as e:
        logger.error("Error signing up user %s: %s", user.username, str(e))
        raise HTTPException(status_code=400, detail="Signup failed")

@simple_router.get("/protected")
async def protected_route(user: dict = Depends(verify_firebase_token)):
    """Protected route that returns a greeting message."""
    uid = user['uid']
    email = user.get('email', 'User')
    logger.info("Accessing protected route for user: %s", email)
    return {"message": f"Hello, {email}!"}