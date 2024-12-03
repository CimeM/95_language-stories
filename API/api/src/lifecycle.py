from typing import Awaitable, Callable

from fastapi import FastAPI
import firebase_admin
# from firebase_admin import credentials
from firebase_admin import credentials

def register_startup_event(app: FastAPI) -> Callable[[], Awaitable[None]]:
    """Actions to run on app startup.

    This function uses fastAPI app to store data
    inthe state, such as db_engine.

    :param app: the fastAPI app.
    :return: function that actually performs actions.
    """

    @app.on_event('startup')
    async def _startup() -> None:
        cred = credentials.Certificate('/app/serviceAccountKey.json')
        firebase_admin.initialize_app(cred, {
            'projectId': 'carexpensetracker-fb5f7',
        })
    return _startup


def register_shutdown_event(app: FastAPI) -> Callable[[], Awaitable[None]]:
    """Actions to run on app's shutdown.

    :param app: fastAPI app.
    :return: function that actually performs actions.
    """

    @app.on_event("shutdown")
    async def _shutdown() -> None:
        pass

    return _shutdown