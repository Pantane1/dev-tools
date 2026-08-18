from pydantic import BaseModel, Field, model_validator


class PasswordGenerateRequest(BaseModel):
    length: int = Field(16, ge=4, le=128)
    uppercase: bool = True
    lowercase: bool = True
    numbers: bool = True
    symbols: bool = True
    exclude_ambiguous: bool = False
    count: int = Field(1, ge=1, le=20)

    @model_validator(mode="after")
    def _at_least_one_charset(self):
        if not any([self.uppercase, self.lowercase, self.numbers, self.symbols]):
            raise ValueError("Select at least one character set.")
        return self


class PasswordItem(BaseModel):
    password: str
    entropy_bits: float
    strength: str  # "weak" | "fair" | "good" | "strong" | "excellent"


class PasswordGenerateResponse(BaseModel):
    success: bool = True
    passwords: list[PasswordItem]
