from collections import defaultdict, deque
from backend.services.quality_service import quality_score  # updated to URL-based

def group_duplicates(similar_pairs: list[dict], image_urls: list[str]) -> tuple[list[dict], list[str]]:
    """
    Groups duplicate images based on similarity graph.

    Args:
        similar_pairs: [
            {"img1": url1, "img2": url2, "similarity": float}
        ]
        image_urls: all image URLs for the user

    Returns:
        groups: list of duplicate groups
        unique_images: images not part of any duplicate group
    """
    graph = defaultdict(set)

    for pair in similar_pairs:
        img1, img2, sim = pair["img1"], pair["img2"], pair["similarity"]
        graph[img1].add((img2, sim))
        graph[img2].add((img1, sim))

    visited = set()
    groups = []

    for image in image_urls:
        if image in visited:
            continue

        queue = deque([image])
        component = []
        visited.add(image)

        while queue:
            current = queue.popleft()
            component.append(current)

            for neighbor, _ in graph[current]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)

        # Only group duplicates (ignore singletons)
        if len(component) <= 1:
            continue

        # Compute quality scores
        scores = {img: quality_score(img) for img in component}
        best_image = max(scores, key=scores.get)

        max_similarity = max(
            (sim for img in component for neigh, sim in graph[img] if neigh in component),
            default=0.0
        )

        groups.append({
            "images": sorted(component),
            "best_image": best_image,
            "quality_scores": scores,
            "max_similarity": round(max_similarity, 3),
            "group_size": len(component),
        })

    unique_images = sorted(set(image_urls) - visited)
    return groups, unique_images
