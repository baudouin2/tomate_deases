from django.urls import path
from .views import UserAuthView

app_name = 'authentication'

urlpatterns = [
    path("authentication/", UserAuthView.as_view(), name="authentication"),
]
