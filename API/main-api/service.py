from fastapi import HTTPException, status
import logging
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError
from config import keycloak_openid, keycloak_admin, dbcursor
from models import UserInfo, UserCreate

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def authenticate_user(username: str, password: str) -> str:
        """
        Authenticate the user using Keycloak and return an access token.
        """
        try:
            token = keycloak_openid.token(username, password)
            return token["access_token"]
        except KeycloakAuthenticationError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

    @staticmethod
    def verify_token(token: str) -> UserInfo:
        """
        Verify the given token and return user information.
        """
        try:
            user_info = keycloak_openid.userinfo(token)
            print(user_info)
            if not user_info:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
                )
            return UserInfo(
                preferred_username=user_info["preferred_username"],
                email=user_info.get("email"),
                full_name=user_info.get("name"),
            )
        except KeycloakAuthenticationError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    @staticmethod
    @staticmethod
    def register_user(user: UserCreate) -> str:
        """
        Register a new user in Keycloak and return an access token.
        """
        logger.info(f"Attempting to register user: {user.username}")

        try:
            # Check if user already exists
            existing_user = keycloak_admin.get_users(query={"username": user.username})
            if existing_user:
                logger.warning(f"User {user.username} already exists")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already exists"
                )
            else:
                logger.info(f"OK: User {user.username} does not exist in Keycloak")
            # Create user in Keycloak
            logger.info(f"Creating user {user.username} in Keycloak")

            new_user = keycloak_admin.create_user({
                "username": user.username,
                "enabled": True,
                "credentials": [{
                    "type": "password",
                    "value": user.password,
                    "temporary": False
                }]
            }, exist_ok=False )

            # Get the user ID of the newly created user
            user_id = new_user
            logger.info(f"User {user.username} created successfully with ID: {user_id}")

            # Set the user's password
            logger.info(f"Setting password for user {user.username}")
            keycloak_admin.set_user_password(user_id, user.password, temporary=False)

            # Retrieve the newly created user
            logger.info(f"Authenticating user {user.username}")
            token = AuthService.authenticate_user(user.username, user.password)

            logger.info(f"User {user.username} registered and authenticated successfully")
            return token

        except KeycloakGetError as e:
            logger.error(f"Failed to register user {user.username}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register user",
            )
        except Exception as e:
            logger.error(f"Unexpected error during user registration: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred during registration",
            )
        