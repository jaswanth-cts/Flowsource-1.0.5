from fastapi import FastAPI

def create_app() -> FastAPI:
    app = FastAPI(docs_url=None, redoc_url=None)

    from .routes.hello import router as HelloRouter
    app.include_router(HelloRouter)

    return app
