from fastapi import FastAPI
from fastapi.responses import UJSONResponse
from fastapi.routing import APIRouter

from app.routes.users import simple_router 
from app.lifecycle import register_startup_event, register_shutdown_event
from app.exception_handlers import register_exception_handlers
import sys

print(sys.path)

app = FastAPI(
    title='Template App',
    description='This is Template',
    docs_url='/api/docs',
    redoc_url='/api/redoc',
    openapi_url='/api/openapi.json',
    default_response_class=UJSONResponse,
)

# Adds startup and shutdown events.
register_startup_event(app)
register_shutdown_event(app)
register_exception_handlers(app)

api_router = APIRouter()
api_router.include_router(simple_router, prefix='/users', tags=['users'])


app.include_router(router=api_router, prefix='/api')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=3000)