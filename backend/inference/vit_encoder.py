import torch
from transformers import ViTModel, ViTImageProcessor
import numpy as np

processor = ViTImageProcessor.from_pretrained("google/vit-base-patch16-224")
model = ViTModel.from_pretrained("google/vit-base-patch16-224")
model.eval()

def encode_image(img: np.ndarray):
    inputs = processor(images=img, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    embedding = outputs.last_hidden_state[:, 0, :] 
    return embedding.squeeze().numpy()
