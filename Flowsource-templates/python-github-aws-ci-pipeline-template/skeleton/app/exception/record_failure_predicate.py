from app.exception.business_exception import BusinessException

class RecordFailurePredicate:
    """Predicate to evaluate if an exception should be recorded as a failure."""

    def __call__(self, throwable):
        return not isinstance(throwable, BusinessException)
