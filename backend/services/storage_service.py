from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET = os.getenv("UPLOAD_BUCKET", "images")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials not set in .env")

if not SUPABASE_URL.endswith("/"):
    SUPABASE_URL += "/"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def upload_image(file_bytes: bytes, path: str) -> str:
    """
    Upload file to Supabase Storage (v2 sync client)
    """

    if not isinstance(file_bytes, bytes):
        raise TypeError(f"file_bytes must be bytes, got {type(file_bytes)}")

    try:
        # ⚠️ Only two positional arguments: path, file_bytes
        supabase.storage.from_(BUCKET).upload(path, file_bytes)
    except Exception as e:
        raise RuntimeError(f"Supabase upload failed for path '{path}': {e}")

    # Return public URL
    return supabase.storage.from_(BUCKET).get_public_url(path)


def list_user_images(user_id: str) -> list[str]:
    folder = f"{user_id}/"

    try:
        files = supabase.storage.from_(BUCKET).list(folder)
    except Exception as e:
        raise RuntimeError(f"Failed to list files in folder '{folder}': {e}")

    urls = []
    for f in files or []:
        name = f.get("name", "")
        if name.lower().endswith((".jpg", ".jpeg", ".png")):
            urls.append(supabase.storage.from_(BUCKET).get_public_url(f"{folder}{name}"))

    return urls
