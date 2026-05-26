from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    kakao_rest_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "KAKAO_REST_API_KEY",
            "KAKAO_API_KEY",
            "KAKAO_REST_KEY",
            "KAKAO_RESTAPI_KEY",
        ),
    )
    kakao_javascript_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "KAKAO_JAVASCRIPT_KEY",
            "KAKAO_JS_KEY",
            "KAKAO_MAP_KEY",
        ),
    )

    model_config = SettingsConfigDict(
        env_file=(".env", ".enV", ".ENV"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
