import sentry_dramatiq
import sentry_sdk
from sentry_sdk.integrations.redis import RedisIntegration

from fief import __version__
from fief.settings import settings

sentry_sdk.init(
    dsn=settings.sentry_dsn_worker,
    environment=settings.environment.value,
    release=__version__,
    integrations=[sentry_dramatiq.DramatiqIntegration(), RedisIntegration()],
)

from fief import tasks

__all__ = ["tasks"]
