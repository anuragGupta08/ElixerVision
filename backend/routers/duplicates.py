# backend/routers/duplicates.py
from fastapi import APIRouter, HTTPException, Depends
from backend.auth.jwt import get_current_user
from backend.services.embedding_service import generate_embeddings_from_urls
from backend.services.similarity_service import compute_similarity
from backend.services.grouping_service import group_duplicates
from backend.services.storage_service import list_user_images

router = APIRouter(tags=["Duplicates"])  # remove prefix here

@router.post("/")
async def find_duplicates(current_user=Depends(get_current_user)):
    """
    Finds duplicate images for the logged-in user using Supabase Storage.
    """
    try:
        # Fetch user's images
        image_urls = list_user_images(user_id=current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch images: {e}")

    if not image_urls:
        raise HTTPException(status_code=404, detail="No images found for this user")

    # Generate embeddings
    embeddings = generate_embeddings_from_urls(image_urls)
    if not embeddings:
        raise HTTPException(status_code=400, detail="No embeddings generated from images")

    # Compute similarity and group duplicates
    similar_pairs = compute_similarity(embeddings)
    groups, unique_images = group_duplicates(similar_pairs, image_urls)

    return {
        "total_images": len(image_urls),
        "duplicate_groups": groups,
        "unique_images": unique_images,
    }
