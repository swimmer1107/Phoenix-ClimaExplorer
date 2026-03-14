from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, climate

app = FastAPI(title="PyClimaExplorer API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,    prefix="/api/auth",    tags=["Auth"])
app.include_router(climate.router, prefix="/api/climate", tags=["Climate"])

@app.get("/")
def root():
    return {"status": "PyClimaExplorer API running", "docs": "/docs"}
