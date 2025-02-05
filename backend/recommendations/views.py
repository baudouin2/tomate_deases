# recommandations/views.py
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .youtube_api import get_video_recommendations

@api_view(["GET"])
def video_recommendations(request):
    # Récupérer le paramètre 'query' ou utiliser une valeur par défaut
    query = request.GET.get("query", "tomates")

    try:
        # Appel à la fonction pour récupérer et enregistrer les vidéos
        videos = get_video_recommendations(query)

        if isinstance(videos, dict) and "error" in videos:
            # Si une erreur a été renvoyée (par exemple une erreur d'API)
            return JsonResponse({"message": f"Erreur lors de la récupération des vidéos : {videos['error']}"}, status=500)

        if not videos:
            # Si aucune vidéo n'est trouvée, renvoyer une réponse avec un message approprié
            return JsonResponse(
                {"message": "Aucune vidéo trouvée pour la requête.", "videos": []},
                status=200
            )
        
        # Renvoi des vidéos dans la réponse sous une forme plus simple
        response_videos = [
            {
                "id": index,  # Utilise l'index comme identifiant unique
                "title": video["title"],
                "url": video["url"],
                "thumbnail": video["thumbnail"],
                "description": video["description"]
            }
            for index, video in enumerate(videos)
        ]
        
        return JsonResponse({"videos": response_videos}, status=200)

    except Exception as e:
        # En cas d'erreur générale
        return JsonResponse(
            {"message": f"Erreur lors de la récupération des vidéos : {str(e)}"},
            status=500
        )
