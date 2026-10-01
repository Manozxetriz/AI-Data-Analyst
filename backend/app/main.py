from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html

from app.routers import schools
from app.routers import products
from app.routers import sales
from app.routers.auth import router as auth_router


app = FastAPI(
    title="AI Business Analyst API",
    version="1.0.0",
    docs_url=None
)

app.include_router(schools.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(auth_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - Swagger UI",
        swagger_ui_parameters={
            "docExpansion": "none"
        }
    )


@app.get("/")
def root():
    return {
        "message": "AI Business Analyst API is running"
    }