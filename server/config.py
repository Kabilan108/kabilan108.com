from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    R2_ACCESS_KEY_ID: str
    R2_BUCKET_NAME: str
    R2_ENDPOINT_URL: str
    R2_PUBLIC_URL: str
    R2_SECRET_ACCESS_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()
