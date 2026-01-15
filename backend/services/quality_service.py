import requests
from io import BytesIO
import numpy as np
from PIL import Image, ImageOps
import cv2

def load_gray_image_from_url(url: str):
    """
    Loads a grayscale image from a public URL
    """
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    img = Image.open(BytesIO(response.content))
    img = ImageOps.exif_transpose(img)
    img = img.convert("L")  # grayscale
    return np.array(img)

def sharpness_score_url(url: str) -> float:
    """
    Computes sharpness of an image from URL using Laplacian variance
    """
    gray = load_gray_image_from_url(url)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def resolution_score_url(url: str) -> float:
    """
    Computes resolution score (width * height) for an image from URL
    """
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    img = Image.open(BytesIO(response.content))
    img = ImageOps.exif_transpose(img)
    w, h = img.size
    return w * h

def quality_score(url: str) -> float:
    """
    Returns a combined quality score from sharpness and resolution
    """
    sharpness = sharpness_score_url(url)
    resolution = resolution_score_url(url)
    return 0.7 * sharpness + 0.3 * (resolution / 1_000_000)  # normalized
