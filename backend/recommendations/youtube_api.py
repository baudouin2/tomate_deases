# recommandations/youtube_api.py
import requests
from .models import VideoRecommendation

YOUTUBE_API_KEY = "AIzaSyAlQ-MMyUnziyWGg38MNZJG5lv0AOmIXd0"
YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search"

def get_video_recommendations(query='tomate cameroun'):
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 15,
        "key": YOUTUBE_API_KEY,
    }

    try:
        response = requests.get(YOUTUBE_API_URL, params=params)
        response.raise_for_status()  # Vérifie si la réponse est correcte (200 OK)
        data = response.json()
        
        # Sauvegarde les vidéos récupérées dans la base de données
        videos = []
        for item in data.get("items", []):
            video = VideoRecommendation(
                title=item["snippet"]["title"],
                url=f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                thumbnail=item["snippet"]["thumbnails"]["default"]["url"],
                description=item["snippet"].get("description", "")
            )
            video.save()  # Sauvegarde chaque vidéo dans la base de données
            videos.append({
                "title": video.title,
                "url": video.url,
                "thumbnail": video.thumbnail,
                "description": video.description
            })
        
        return videos

    except requests.exceptions.RequestException as e:
        # En cas d'erreur dans l'appel API, renvoyer une erreur générique
        return {"error": str(e)}
