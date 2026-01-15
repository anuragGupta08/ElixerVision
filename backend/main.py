from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from backend.routers import images, upload, duplicates, delete_duplicate
from backend.auth import routes as auth_routes
from backend.routers import admin

# Create FastAPI app
app = FastAPI(title="Image Duplicate Finder API")

# Include routers
app.include_router(images.router, tags=["Images"])
app.include_router(admin.router)
app.include_router(auth_routes.router, tags=["Auth"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(duplicates.router, prefix="/duplicates", tags=["Duplicates"])
app.include_router(delete_duplicate.router, prefix="/duplicates", tags=["Delete Duplicates"])

# CORS middleware
origins = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",  # optional for local testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
def health():
    return {"status": "ok"}
