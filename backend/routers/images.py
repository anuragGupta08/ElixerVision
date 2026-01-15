# images.py
from fastapi import APIRouter, Depends, HTTPException
from backend.auth.jwt import get_current_user
from backend.services.storage_service import supabase

router = APIRouter(prefix="/images", tags=["Images"])


@router.get("/")
async def list_user_images(current_user=Depends(get_current_user)):
    try:
        response = (
            supabase
            .table("images")
            .select("url, filename, size_kb")
            .eq("user_id", current_user.id)  # ✅ INT
            .order("uploaded_at", desc=True)
            .execute()
        )

        images_data = response.data or []

        images = [
            {
                "url": img["url"],
                "name": img["filename"],
                "size": img["size_kb"],
            }
            for img in images_data
        ]

        return {"images": images}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list images: {e}"
        )
