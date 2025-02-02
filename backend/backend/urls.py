from django.urls import path, include

urlpatterns = [
    # Routes pour le chatbot
    path("api/chatbot/", include("chatbot.urls", namespace="chatbot")),
    
    # Routes pour le diagnostic des maladies
    path("api/diagnosis/", include("diagnosis.urls", namespace="diagnosis")),
    
    # Routes pour les recommandations basées sur YouTube
    path("api/youtube/", include("recommendations.urls", namespace="recommendations")),
]
