from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    #Circuit Breaker Configuration
    recovery_time_secs: int = int(os.getenv('RECOVERY_TIME_SECS', 60))
    failure_threshold: int = int(os.getenv('FAILURE_THRESHOLD', 5))

    #Retry Configuration
    max_attempts: int = int(os.getenv('MAX_ATTEMPTS', 3))

    #Bulkhead Configuration
    max_concurrency: int = int(os.getenv('MAX_CONCURRENCY', 5))
    max_capacity: int = int(os.getenv('MAX_CAPACITY', 10))

    #Rate Limiter Configuration
    max_executions: float = float(os.getenv('MAX_EXECUTIONS', 3.0))
    per_time_secs: float = float(os.getenv('PER_TIME_SECS', 10.0))
