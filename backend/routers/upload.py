# upload.py
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from backend.auth.jwt import get_current_user
from backend.services.storage_service import upload_image, BUCKET, supabase
from uuid import uuid4
from pathlib import Path

router = APIRouter(tags=["Upload"])


@router.post("/")
async def upload_files(
    files: list[UploadFile] = File(...),
    current_user=Depends(get_current_user),
):
    allowed_extensions = {".jpg", ".jpeg", ".png"}
    uploaded_files = []

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    for file in files:
        ext = Path(file.filename).suffix.lower()
        if ext not in allowed_extensions:
            continue

        try:
            await file.seek(0)
            file_bytes = await file.read()

            if not file_bytes:
                continue

            path = f"{current_user.id}/{uuid4()}{ext}"

            public_url = upload_image(file_bytes, path)

            size_kb = len(file_bytes) // 1024

            insert_res = supabase.table("images").insert({
                "user_id": current_user.id,  
                "filename": file.filename,
                "url": public_url,
                "size_kb": size_kb,
            }).execute()

            if insert_res.data is None:
                raise Exception("Failed to insert image metadata")

            uploaded_files.append({
                "url": public_url,
                "name": file.filename,
                "size": size_kb,
            })

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Upload failed for {file.filename}: {e}"
            )

    if not uploaded_files:
        raise HTTPException(status_code=400, detail="No valid image files were uploaded.")

    return {
        "message": f"Uploaded {len(uploaded_files)} image(s) successfully.",
        "files": uploaded_files,
    }
