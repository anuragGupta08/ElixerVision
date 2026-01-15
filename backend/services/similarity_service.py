from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def hybrid_similarity(e1, e2, w_resnet=0.5, w_vit=0.5):
    """
    Computes weighted hybrid similarity between two images
    """
    sim_resnet = cosine_similarity(
        [e1["resnet"]], [e2["resnet"]]
    )[0][0]

    sim_vit = cosine_similarity(
        [e1["vit"]], [e2["vit"]]
    )[0][0]

    return w_resnet * sim_resnet + w_vit * sim_vit


def compute_similarity(embeddings: dict, threshold=0.9):
    if not embeddings:
        return []

    files = list(embeddings.keys())
    pairs = []

    for i in range(len(files)):
        for j in range(i + 1, len(files)):
            img1 = files[i]
            img2 = files[j]

            sim = hybrid_similarity(
                embeddings[img1],
                embeddings[img2]
            )

            if sim >= threshold:
                pairs.append({
                    "img1": img1,
                    "img2": img2,
                    "similarity": float(sim)
                })

    return pairs