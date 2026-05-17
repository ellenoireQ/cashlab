from fastapi import FastAPI
from routers.convert_any import router as convert_router

app = FastAPI()

# Register convert router
app.include_router(convert_router, prefix="/api/convert", tags=["convert"])


@app.get("/")
def read_root():
    return {"message": "Hello World"}


@app.get("/api/hello")
def hello():
    return {"message": "Hello from Cashlab API!"}
