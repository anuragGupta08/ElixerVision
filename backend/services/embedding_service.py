import numpy as np
import requests
from io import BytesIO
from PIL import Image

from backend.services.preprocessing import preprocess_image
from backend.inference.resnet_encoder import encode_image
from backend.inference.vit_encoder import encode_image as vit_encode
from backend.services.storage_service import supabase, BUCKET


def load_image_from_url(url: str) -> Image.Image:
    """
    Downloads an image from a URL (public or signed) and returns a PIL Image.
    Raises an exception if download fails.
    """
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return Image.open(BytesIO(response.content)).convert("RGB")


def generate_embeddings_from_urls(image_urls: list[str]) -> dict:
    """
    Generates embeddings for images stored in Supabase.

    For private buckets, generates signed URLs automatically.

    Returns:
        {
            image_url: {
                "resnet": np.array,
                "vit": np.array
            }
        }
    """
    embeddings = {}

    for url in image_urls:
        try:
            # If the URL is from Supabase and not public, create a signed URL
            if "supabase.co/storage/v1/object/public" not in url:
                # Extract object path from URL
                # e.g., https://<project>.supabase.co/storage/v1/object/<bucket>/user_id/filename.jpg
                path = url.split(f"/{BUCKET}/")[-1]
                url = supabase.storage.from_(BUCKET).create_signed_url(path, expires_in=3600).signed_url

            print(f"[DEBUG] Loading image from URL: {url}")
            image = load_image_from_url(url)

            # Preprocess image (resize, normalize, etc.)
            img_array = preprocess_image(image)

            # Generate embeddings
            resnet_embedding = encode_image(img_array)
            vit_embedding = vit_encode(img_array)

            embeddings[url] = {
                "resnet": resnet_embedding,
                "vit": vit_embedding,
            }

        except Exception as e:
            print(f"[Embedding Error] Failed for {url}: {e}")
            continue

    print(f"[DEBUG] Generated embeddings for {len(embeddings)}/{len(image_urls)} images")
    return embeddings
