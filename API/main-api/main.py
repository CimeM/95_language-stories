from fastapi import FastAPI, Depends, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models import TokenResponse, UserInfo, UserCreate
from controller import AuthController
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import HTTPException


app = FastAPI()

# Add CORSMiddleware to the application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Initialize the HTTPBearer scheme for authentication
bearer_scheme = HTTPBearer()

# Define the root endpoint
@app.get("/")
async def read_root():
    """
    Root endpoint that provides a welcome message and documentation link.
    """
    return AuthController.read_root()


# Define the login endpoint
@app.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    """
    Login endpoint to authenticate the user and return an access token.

    Args:
        username (str): The username of the user attempting to log in.
        password (str): The password of the user.

    Returns:
        TokenResponse: Contains the access token upon successful authentication.
    """
    return AuthController.login(username, password)


@app.post("/signup", response_model=TokenResponse)
@limiter.limit("3/minute")
async def signup(request: Request, user: UserCreate):
    """
    Signup endpoint to register a new user and return an access token.

    Args:
        user (UserCreate): The user information for registration.

    Returns:
        TokenResponse: Contains the access token upon successful registration.

    Raises:
        HTTPException: If registration fails or user already exists.
    """
    
    try:
        return AuthController.signup(user)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

# Define the protected endpoint
@app.get("/protected", response_model=UserInfo)
async def protected_endpoint(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Protected endpoint that requires a valid token for access.

    Args:
        credentials (HTTPAuthorizationCredentials): Bearer token provided via HTTP Authorization header.

    Returns:
        UserInfo: Information about the authenticated user.
    """
    return AuthController.protected_endpoint(credentials)
