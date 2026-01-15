import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
import numpy as np

model = ResNet50(weights="imagenet", include_top=False, pooling="avg")

def encode_image(img: np.ndarray):
    """
    img shape: (224, 224, 3)
    """
    img = np.expand_dims(img * 255.0, axis=0)  # (1, 224, 224, 3)
    img = preprocess_input(img)
    embedding = model.predict(img, verbose=0)
    return embedding.flatten()