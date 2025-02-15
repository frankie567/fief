import sentry_sdk
from fastapi import FastAPI
from sentry_sdk.integrations.asgi import SentryAsgiMiddleware
from sentry_sdk.integrations.redis import RedisIntegration

from fief import __version__
from fief.apps import admin_app, admin_frontend_app, auth_app
from fief.db.workspace import workspace_engine_manager
from fief.settings import settings

sentry_sdk.init(
    dsn=settings.sentry_dsn_server,
    environment=settings.environment.value,
    release=__version__,
    integrations=[RedisIntegration()],
)

app = FastAPI(openapi_url=None)

app.add_middleware(SentryAsgiMiddleware)

app.mount("/admin/api", admin_app)
app.mount("/admin", admin_frontend_app)
app.mount("/", auth_app)


@app.on_event("shutdown")
async def on_shutdown():
    await workspace_engine_manager.close_all()


__all__ = ["app"]
