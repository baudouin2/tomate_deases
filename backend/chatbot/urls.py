from django.urls import path
from .views import chatbot_response
app_name = 'chatbot'
urlpatterns = [
    path("chatbot/", chatbot_response, name="chatbot"),
]
