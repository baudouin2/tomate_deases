from django.http import JsonResponse
from .models import VideoRecommendation
import requests

YOUTUBE_API_KEY = "AIzaSyAlQ-MMyUnziyWGg38MNZJG5lv0AOmIXd0"
YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search"

def get_video_recommendations(request):
    query = request.GET.get('query', 'tomate cameroun')
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
        
        videos = []
        for item in data.get("items", []):
            video = {
                "title": item["snippet"]["title"],
                "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                "thumbnail": item["snippet"]["thumbnails"]["default"]["url"],
                "description": item["snippet"].get("description", "")
            }
            videos.append(video)
        
        return JsonResponse(videos, safe=False)

    except requests.exceptions.RequestException as e:
        # En cas d'erreur dans l'appel API, renvoyer une erreur générique
        return JsonResponse({"error": str(e)}, status=500)
