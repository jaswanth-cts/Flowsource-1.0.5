from typing import Any
from hyx.circuitbreaker import consecutive_breaker
from hyx.circuitbreaker.exceptions import BreakerFailing
from hyx.ratelimit.exceptions import RateLimitExceeded
from hyx.retry.exceptions import MaxAttemptsExceeded
from hyx.fallback import fallback
from app.config.settings import Settings
from hyx.retry import retry
from hyx.bulkhead import bulkhead
from hyx.bulkhead.exceptions import BulkheadFull
from app.exception.business_exception import BusinessException
from .fallback_methods import FallbackMethods

settings = Settings()

class HttpServerError(Exception):
    pass

class HelloService:
    breaker = consecutive_breaker(
        exceptions=(MaxAttemptsExceeded,),
        failure_threshold=settings.failure_threshold,
        recovery_time_secs=settings.recovery_time_secs,
    )

    @fallback(FallbackMethods.CallNotPermittedException, on=BreakerFailing)
    @fallback(FallbackMethods.Retry, on=MaxAttemptsExceeded)
    @fallback(FallbackMethods.BulkHeadExcepion, on=BulkheadFull)
    @breaker
    @retry(on=(HttpServerError),attempts=settings.max_attempts)
    @bulkhead(max_concurrency=settings.max_concurrency, max_capacity=settings.max_capacity)
    async def hello(self):
        return "Hello, World!"

    
    @fallback(FallbackMethods.CallNotPermittedException, on=BreakerFailing)
    @fallback(FallbackMethods.Retry,on = MaxAttemptsExceeded)
    @fallback(FallbackMethods.BulkHeadExcepion,on=BulkheadFull)
    @breaker
    @retry(on=(HttpServerError),attempts=settings.max_attempts)
    @bulkhead(max_concurrency=settings.max_concurrency,max_capacity=settings.max_capacity)
    async def failure(self) -> dict[str, Any]:
        raise HttpServerError

    @fallback(FallbackMethods.CallNotPermittedException, on=BreakerFailing)
    @fallback(FallbackMethods.BulkHeadExcepion,on=BulkheadFull)
    @fallback(FallbackMethods.BUException,on=BusinessException)
    @breaker
    @bulkhead(max_concurrency=settings.max_concurrency,max_capacity=settings.max_capacity)
    async def ignore_exception(self):
           raise BusinessException

