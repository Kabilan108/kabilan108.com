from pydantic_settings import BaseSettings
from fastapi import FastAPI
from logfire import Logfire


class Settings(BaseSettings):
    NAME: str = "api.kabilan108.com"

    API_KEY: str

    R2_ACCESS_KEY_ID: str
    R2_BUCKET_NAME: str
    R2_ENDPOINT_URL: str
    R2_PUBLIC_URL: str
    R2_SECRET_ACCESS_KEY: str

    LOGFIRE_TOKEN: str
    LOG_LEVEL: str

    class Config:
        env_file = ".env"


def configure_logging(app: FastAPI) -> Logfire:
    import logfire

    log = logfire.configure(
        service_name=settings.NAME,
        token=settings.LOGFIRE_TOKEN,
        console=logfire.ConsoleOptions(min_log_level=settings.LOG_LEVEL),
    )
    log.instrument_system_metrics()
    log.instrument_fastapi(app=app, capture_headers=True)
    return log


settings = Settings()
