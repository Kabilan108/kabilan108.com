from fastapi import FastAPI

from config import configure_logging, settings
from schema import ServerResponse
from routes import s3_router

app = FastAPI(title=settings.NAME)
app.include_router(s3_router)
log = configure_logging(app)


@app.get("/")
def read_root() -> ServerResponse:
    return {
        "message": "Hello World",
    }
