from fastapi import FastAPI

from trip_packer.routers import items, luggage, packing, trips

app = FastAPI()
app.include_router(items.router)
app.include_router(luggage.router)
app.include_router(trips.router)
app.include_router(packing.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Trip Tracker!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
