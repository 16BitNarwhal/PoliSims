from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.industry_metrics import router as industry_router
from app.routes.population_routes import router as population_router
from app.routes.bills_routes import router as bills_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(industry_router)
app.include_router(population_router)
app.include_router(bills_router)


@app.get("/")
async def root():
    return {"message": "Welcome to PoliSims Backend API"}
