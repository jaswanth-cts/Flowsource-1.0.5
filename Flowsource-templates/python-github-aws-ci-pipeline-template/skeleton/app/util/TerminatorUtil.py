import logging

from app.test.controller.test_messages import app

logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Cleaning up resources, for graceful shutdown, during SIGTERM signal.")
    # TODO: Clean up resources, for graceful shutdown
