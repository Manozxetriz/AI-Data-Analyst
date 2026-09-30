from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import schools
from app.routers import products
from app.routers import sales
app = FastAPI(
    title="AI Business Analyst API",
    version="1.0.0"
)
app.include_router(schools.router)
app.include_router(products.router)
app.include_router(sales.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Business Analyst API is running"
    }