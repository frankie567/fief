from fastapi import APIRouter, Request
from fastapi.param_functions import Depends
from jwcrypto import jwk

from fief.dependencies.current_workspace import get_current_workspace
from fief.dependencies.tenant import get_current_tenant
from fief.models import Tenant, Workspace
from fief.schemas.well_known import OpenIDProviderMetadata
from fief.services.response_type import ALLOWED_RESPONSE_TYPES
from fief.settings import settings

router = APIRouter()


@router.get("/openid-configuration", name="well_known:openid_configuration")
async def get_openid_configuration(
    request: Request,
    workspace: Workspace = Depends(get_current_workspace),
    tenant: Tenant = Depends(get_current_tenant),
):
    url_for_params = {}
    if not tenant.default:
        url_for_params["tenant_slug"] = tenant.slug

    def _url_for(name: str) -> str:
        return request.url_for(name, **url_for_params)

    configuration = OpenIDProviderMetadata(
        issuer=tenant.get_host(workspace.domain),
        authorization_endpoint=_url_for("auth:authorize"),
        token_endpoint=_url_for("auth:token"),
        userinfo_endpoint=_url_for("user:userinfo.get"),
        jwks_uri=_url_for("well_known:jwks"),
        registration_endpoint=_url_for("register:get"),
        scopes_supported=["openid", "offline_access"],
        response_types_supported=ALLOWED_RESPONSE_TYPES,
        response_modes_supported=["query", "fragment"],
        grant_types_supported=["authorization_code", "refresh_token"],
        subject_types_supported=["public"],
        id_token_signing_alg_values_supported=["RS256"],
        id_token_encryption_alg_values_supported=["RSA-OAEP-256"],
        id_token_encryption_enc_values_supported=["A256CBC-HS512"],
        userinfo_signing_alg_values_supported=["none"],
        token_endpoint_auth_methods_supported=[
            "client_secret_basic",
            "client_secret_post",
        ],
        claims_supported=["email", "tenant_id"],
        request_parameter_supported=False,
        code_challenge_methods_supported=["plain", "S256"],
        service_documentation=settings.fief_documentation_url,
    )

    return configuration.dict(exclude_unset=True)


@router.get("/jwks.json", name="well_known:jwks")
async def get_jwks(tenant: Tenant = Depends(get_current_tenant)):
    keyset = jwk.JWKSet(keys=tenant.get_sign_jwk())
    return keyset.export(private_keys=False, as_dict=True)
