import requests
import time
from django.core.cache import cache
from .models import VideoRecommendation

YOUTUBE_API_KEY = "AIzaSyAlQ-MMyUnziyWGg38MNZJG5lv0AOmIXd0"
YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search"
REQUEST_DELAY = 300  # 5 minutes

def get_video_recommendations(query):
    # Vérifie si les résultats sont en cache (expiration 10 minutes)
    cached_videos = cache.get(query)
    if cached_videos:
        return cached_videos

    # Vérifie le délai depuis la dernière requête
    last_request_time = cache.get(f"{query}_last_request_time")
    if last_request_time and (time.time() - last_request_time) < REQUEST_DELAY:
        remaining_time = REQUEST_DELAY - (time.time() - last_request_time)
        return {"error": f"Veuillez attendre encore {int(remaining_time)} secondes avant une nouvelle requête."}

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 15,
        "key": YOUTUBE_API_KEY,
    }

    try:
        response = requests.get(YOUTUBE_API_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if "items" not in data or not isinstance(data["items"], list):
            return {"error": "Aucune vidéo trouvée."}

        videos = []
        for item in data["items"]:
            video_url = f"https://www.youtube.com/watch?v={item['id']['videoId']}"
            
            # Vérifie si la vidéo existe déjà en BD
            video, created = VideoRecommendation.objects.get_or_create(
                url=video_url,
                defaults={
                    "title": item["snippet"]["title"],
                    "thumbnail": item["snippet"]["thumbnails"]["default"]["url"],
                    "description": item["snippet"].get("description", ""),
                }
            )

            videos.append({
                "title": video.title,
                "url": video.url,
                "thumbnail": video.thumbnail,
                "description": video.description,
            })

        # Stocke les résultats en cache (10 minutes)
        cache.set(query, videos, timeout=100)
        cache.set(f"{query}_last_request_time", time.time(), timeout=REQUEST_DELAY)

        return videos

    except requests.exceptions.Timeout:
        return {"error": "La requête a expiré, veuillez réessayer."}
    except requests.exceptions.HTTPError as e:
        return {"error": f"Erreur HTTP : {str(e)}"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Erreur réseau : {str(e)}"}
    except Exception as e:
        return {"error": f"Erreur inattendue : {str(e)}"}
