from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import VideoRecommendation
from .youtube_api import get_video_recommendations
import time
from nltk.stem.snowball import FrenchStemmer

# Délai entre les requêtes (1 minute)
RESPONSE_DELAY = 10  
last_response_time = 0  # Stocker le dernier timestamp de la réponse

# Fonction pour extraire les racines des mots (stemming)
def get_stemmed_words(text):
    stemmer = FrenchStemmer()
    words = text.lower().split()  # Découpage en mots
    return {stemmer.stem(word) for word in words}  # Appliquer le stemming et retourner un ensemble unique

@api_view(["GET"])
def video_recommendations(request):
    global last_response_time
    query = request.GET.get("query", "").strip()
    
    if not query:  # Vérifier si la requête est vide
        print("⚠️ Requête sans mot-clé.")
        return JsonResponse({"message": "Veuillez fournir un mot-clé pour la recherche."}, status=400)
    
    print(f"🔎 Requête reçue avec les mots-clés : {query}")

    current_time = time.time()
    time_since_last_request = current_time - last_response_time

    # Vérifier si une nouvelle requête peut être envoyée
    if time_since_last_request < RESPONSE_DELAY:
        remaining_time = RESPONSE_DELAY - time_since_last_request
        print(f"⏳ Trop tôt pour une nouvelle requête. Attendez encore {remaining_time:.1f} secondes.")
        return JsonResponse(
            {"message": f"Veuillez attendre encore {int(remaining_time)} secondes avant de refaire une requête."},
            status=429
        )

    try:
        # Récupérer les vidéos via l’API YouTube
        videos = get_video_recommendations(query)
        print(f"📺 {len(videos)} vidéos récupérées depuis l'API YouTube.")

        if not videos:
            print("❌ Aucune vidéo trouvée dans l'API YouTube.")
            return JsonResponse({"message": "Aucune vidéo trouvée.", "videos": []}, status=200)

        # Sauvegarde des vidéos en base de données
        for video in videos:
            obj, created = VideoRecommendation.objects.get_or_create(
                url=video["url"],
                defaults={
                    "title": video["title"],
                    "thumbnail": video["thumbnail"],
                    "description": video.get("description", "")
                }
            )
            if created:
                print(f"✅ Vidéo sauvegardée : {video['title']} ({video['url']})")
            else:
                print(f"🔁 Vidéo déjà existante : {video['title']} ({video['url']})")

    except Exception as e:
        print(f"❌ Erreur API YouTube: {str(e)}")
        return JsonResponse({"message": f"Erreur lors de la récupération des vidéos : {str(e)}"}, status=500)

    # Récupérer toutes les vidéos de la base de données et les trier selon la similarité avec CHAQUE mot de la requête
    query_words = query.lower().split()  # Séparer chaque mot de la requête
    all_videos = VideoRecommendation.objects.all()
    print(f"📊 Nombre total de vidéos en base : {all_videos.count()}")

    video_scores = []
    for video in all_videos:
        title_words = video.title.lower().split()  # Séparer les mots du titre
        score = sum(1 for word in query_words if word in title_words)  # Compter les mots communs
        print(f"🔍 Score {score} pour la vidéo : {video.title}")  # Debugging
        video_scores.append((score, video))

    # Trier les vidéos par pertinence (score décroissant)
    filtered_videos = sorted([v for v in video_scores if v[0] > 0], key=lambda x: x[0], reverse=True)

    # Si aucune vidéo ne correspond, envoyer les 22 premières en fallback
    if not filtered_videos:
        print("⚠️ Aucun match exact, envoi des 5 premières vidéos.")
        filtered_videos = sorted(video_scores, key=lambda x: x[0], reverse=True)[:22]

    response_videos = [
        {
            "id": video.id,
            "title": video.title,
            "url": video.url,
            "thumbnail": video.thumbnail,
            "description": video.description
        }
        for _, video in filtered_videos
    ]

    print(f"🚀 {len(response_videos)} vidéos envoyées au frontend.")

    # Mettre à jour le dernier temps de réponse
    last_response_time = current_time

    return JsonResponse({"videos": response_videos}, status=200)
