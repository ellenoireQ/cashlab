from fastapi import FastAPI
from dotenv import load_dotenv
import os

# Load environment variables from .env if present (safe: we will not open the file)
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from routers.convert_any import router as convert_router
from routers.ai_insights import router as ai_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Register routers
app.include_router(convert_router, prefix="/api/convert", tags=["convert"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])


@app.get("/")
def read_root():
    return {"message": "Hello World"}


@app.get("/api/hello")
def hello():
    return {"message": "Hello from Cashlab API!"}
