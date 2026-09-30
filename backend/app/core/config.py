from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    INITIAL_ADMIN_EMAIL: str
    INITIAL_ADMIN_PASSWORD: str

    class Config:
        env_file = "app/.env"


settings = Settings()