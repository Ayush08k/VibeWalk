from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    port: int = 8000
    cors_origins: list[str] = ["*"]
    debug: bool = False
    llm_api_key: str | None = None

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
