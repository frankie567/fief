from pydantic import UUID4, BaseModel, SecretStr

from fief.schemas.generics import CreatedUpdatedAt, UUIDSchema


class AdminAPIKeyCreate(BaseModel):
    name: str


class BaseAdminApiKey(UUIDSchema, CreatedUpdatedAt):
    name: str
    workspace_id: UUID4


class AdminAPIKeyCreateResponse(BaseAdminApiKey):
    token: str


class AdminAPIKey(BaseAdminApiKey):
    token: SecretStr
