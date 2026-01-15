from fastapi import APIRouter, HTTPException, Depends, Query
from backend.auth.jwt import get_current_user
from backend.services.storage_service import supabase, BUCKET
from urllib.parse import urlparse, unquote

router = APIRouter(tags=["Delete Duplicates"])

@router.delete("/delete/")
async def delete_duplicate(
    image_url: str = Query(..., description="Public Supabase image URL"),
    current_user=Depends(get_current_user),
):
    """
    Deletes an image from Supabase Storage AND removes its record from the database.
    Returns size_saved_bytes for frontend.
    """

    # Decode URL and parse Supabase path
    try:
        decoded_url = unquote(image_url)  # Decode percent-encoded URL
        parsed = urlparse(decoded_url)
        path_parts = parsed.path.strip("/").split("/")

        if "public" not in path_parts:
            raise ValueError("Invalid Supabase public URL")

        public_index = path_parts.index("public")
        bucket = path_parts[public_index + 1]
        file_path = "/".join(path_parts[public_index + 2:])

        if bucket != BUCKET:
            raise HTTPException(status_code=400, detail="Invalid bucket")

        # Ensure the file belongs to the current user
        folder_id = file_path.split("/")[0]
        if str(folder_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Cannot delete another user's image")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image URL: {e}")

    # Get file metadata
    file_size = 0
    try:
        meta = supabase.storage.from_(BUCKET).get_metadata(file_path)
        if meta and isinstance(meta, dict) and "size" in meta:
            file_size = int(meta["size"])
    except Exception:
        file_size = 0

    # Delete from Storage
    try:
        storage_result = supabase.storage.from_(BUCKET).remove([file_path])
        if isinstance(storage_result, list) and storage_result[0].get("error"):
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete image from storage: {storage_result[0]['error']}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage deletion failed: {e}")

    # Delete from Database (idempotent)
    try:
        db_result = (
            supabase.table("images")
            .delete()
            .eq("url", decoded_url)
            .eq("user_id", current_user.id)
            .execute()
        )

        # Safely check deleted rows; ignore if nothing was deleted
        deleted_rows = getattr(db_result, "data", None)
        if not deleted_rows:
            deleted_rows = []

    except Exception as e:
        # Only fail if there is a real exception
        raise HTTPException(status_code=500, detail=f"Database deletion failed: {e}")

    # Return success
    return {
        "message": "Image deleted successfully",
        "deleted_path": file_path,
        "size_saved_bytes": file_size,
        "db_rows_deleted": len(deleted_rows)
    }
