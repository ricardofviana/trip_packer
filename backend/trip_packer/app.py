import asyncio
import sys

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from trip_packer.routers import items, luggage, packing, trips

app = FastAPI()

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

api_router.include_router(items.router)
api_router.include_router(luggage.router)
api_router.include_router(trips.router)
api_router.include_router(packing.router)

app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Trip Tracker!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
