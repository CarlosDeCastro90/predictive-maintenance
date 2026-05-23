from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str

    # Groq
    groq_api_key: str
    groq_model: str = "llama3-70b-8192"

    # API
    api_secret_key: str = "change-me"
    environment: str = "development"
    cors_origins: str = "http://localhost:3000"

    # ML
    ml_model_path: str = "app/ml/models/"
    ml_retrain_interval_hours: int = 24

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()