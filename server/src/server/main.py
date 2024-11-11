from fastapi import FastAPI

from server.config import configure_logging, settings
from server.schema import ServerResponse
from server.routes import s3_router

app = FastAPI(title=settings.NAME)
app.include_router(s3_router)
log = configure_logging(app)


@app.get("/", response_model=ServerResponse)
def read_root() -> dict:
    return {
        "message": "Hello World",
    }
