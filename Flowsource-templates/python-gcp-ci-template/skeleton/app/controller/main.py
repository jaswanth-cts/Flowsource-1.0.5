from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from ..routes.hello import router as HelloRouter
from dotenv import load_dotenv
import os

load_dotenv()
ENV = os.getenv('ENV')

app = FastAPI()

if ENV in ['dev', 'qa']:
    @app.get("/", include_in_schema=False)
    async def root():
        response = RedirectResponse(url='/docs')
        return response
else:
    app = FastAPI(docs_url=None, redoc_url=None)

app.include_router(HelloRouter)
