import pytest
from app.service.sample_service import HelloService

@pytest.mark.asyncio
async def test_hello_method():
    service = HelloService()

    response = await service.hello()
    assert response == "Hello, World!"

@pytest.mark.asyncio
async def test_failure_method():
    service = HelloService()

    response = await service.failure()
    assert response == "Fallback message: Handled HTTP Error "

@pytest.mark.asyncio
async def test_ignore_exception_method():
    service = HelloService()

    response = await service.failure()
    assert response == "Fallback message: Handled HTTP Error "
