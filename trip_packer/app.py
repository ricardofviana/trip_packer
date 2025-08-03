from fastapi import FastAPI

from trip_packer.routers import items

app = FastAPI()
app.include_router(items.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Trip Tracker!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
