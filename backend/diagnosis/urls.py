from django.urls import path
from .views import diagnose_disease
app_name = 'diagnosis'
urlpatterns = [
    path("diagnosis/", diagnose_disease, name="diagnosis"),
]
