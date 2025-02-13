from django.urls import path
from .views import video_recommendations

app_name = 'recommendations'

urlpatterns = [
    path("youtube/", video_recommendations, name="youtube"),
]
