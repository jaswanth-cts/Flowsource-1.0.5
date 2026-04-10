from fastapi import APIRouter
from ..service.sample_service import HelloService
from app.config.settings import Settings
from hyx.ratelimit import tokenbucket
from hyx.fallback import fallback
from hyx.ratelimit.exceptions import RateLimitExceeded
from ..service.fallback_methods import FallbackMethods

router = APIRouter()
service = HelloService()
settings = Settings()

@router.get("/hello")
@fallback(FallbackMethods.RateLimiterException,on = RateLimitExceeded)
@tokenbucket(max_executions=settings.max_executions, per_time_secs =settings.per_time_secs)
async def read_hello():
    return await service.hello()

@router.get("/failure")
async def read_failure():
    return await service.failure()

@router.get("/ignore")
async def read_ignore():
    return await service.ignore_exception()
