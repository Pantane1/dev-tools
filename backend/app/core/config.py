"""
Application configuration.

All configuration is loaded from environment variables so that no secret
or environment-specific value is ever hard-coded. See ../.env.example for
the full list of supported variables.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    app_name: str = "Pantane DevTools API"
    api_prefix: str = "/api"

    allowed_origins: str = "http://localhost:3000"

    database_url: str | None = None
    redis_url: str | None = None

    rate_limit_default: str = "60/minute"
    rate_limit_network: str = "20/minute"
    rate_limit_strict: str = "10/minute"

    # Hard cap on any tool-processed text (protects memory/CPU on shared hosting)
    max_input_bytes: int = 2_000_000  # ~2MB

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
