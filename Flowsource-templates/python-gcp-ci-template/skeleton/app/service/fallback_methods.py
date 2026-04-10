class FallbackMethods:
    
    @staticmethod
    async def CallNotPermittedException(e,self):
        return "Fallback message: Handled exception when circuit is OPEN "
    
    @staticmethod
    async def BulkHeadExcepion(e,self):
        return "Fallback message: Any other exception "

    @staticmethod
    async def RateLimiterException(e):
        return "Fallback message: Rate Limit Excceded "
    
    @staticmethod
    async def Retry(e,self):
        return "Fallback message: Handled HTTP Error "

    @staticmethod
    async def BUException(e,self):
        return "Fallback message: This exception is ignored by the CircuitBreaker of helloservice"
