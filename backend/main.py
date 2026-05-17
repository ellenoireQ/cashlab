from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.convert_any import router as convert_router

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

# Register convert router
app.include_router(convert_router, prefix="/api/convert", tags=["convert"])


@app.get("/")
def read_root():
    return {"message": "Hello World"}


@app.get("/api/hello")
def hello():
    return {"message": "Hello from Cashlab API!"}
