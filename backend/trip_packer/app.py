from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from trip_packer.routers import items, luggage, packing, trips

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
