from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}


@app.get("/api/hello")
def hello():
    return {"message": "Hello from Cashlab API!"}
