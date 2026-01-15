from PIL import Image
import numpy as np
import requests
from io import BytesIO

def preprocess_image(img_source, size=(224, 224)) -> np.ndarray:
    """
    Preprocess an image for embedding models.
    
    img_source: str or PIL.Image.Image
        - URL string to load from the web
        - PIL Image object
        - Local path (optional fallback)
    size: tuple
        Target size for resizing (default: 224x224)
    
    Returns:
        Normalized numpy array of shape (H, W, C) in range [0, 1]
    """
    # Load image
    if isinstance(img_source, str):
        if img_source.startswith("http://") or img_source.startswith("https://"):
            response = requests.get(img_source, timeout=10)
            response.raise_for_status()
            img = Image.open(BytesIO(response.content))
        else:
            img = Image.open(img_source)
    elif isinstance(img_source, Image.Image):
        img = img_source
    else:
        raise ValueError(f"Unsupported image source type: {type(img_source)}")

    # Convert and resize
    img = img.convert("RGB")
    img = img.resize(size)

    # Normalize to [0, 1]
    img_array = np.array(img, dtype=np.float32) / 255.0
    return img_array
