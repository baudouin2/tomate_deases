from django.urls import path
from .views import diagnose_disease

urlpatterns = [
    path("diagnosis/", diagnose_disease, name="diagnosis"),
]
