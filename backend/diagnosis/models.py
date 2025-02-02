from django.db import models

class DiseaseDiagnosis(models.Model):
    # Image de la tomate pour le diagnostic
    tomato_image = models.ImageField(upload_to='tomato_images/')
    
    # Paramètres environnementaux
    humidity = models.FloatField()  # Humidité (80 à 95)
    temperature = models.FloatField()  # Température (10 à 25)
    
    # Paramètres agricoles
    shading_level = models.CharField(
        max_length=10,
        choices=[('faible', 'Faible'), ('modéré', 'Modéré'), ('élevé', 'Élevé')],
        default='modéré'
    )  # Niveau d'ombrage (faible, modéré, élevé)
    
    plantation_density = models.CharField(
        max_length=10,
        choices=[('faible', 'Faible'), ('moyenne', 'Moyenne'), ('élevée', 'Élevée')],
        default='moyenne'
    )  # Densité de plantation (faible, moyenne, élevée)
    
    irrigation_frequency = models.CharField(
        max_length=100,
        choices=[('irrégulière', 'Irrégulière'), ('régulière', 'Régulière')],
        default='irrégulière'
    )  # Fréquence d'irrigation (irrégulière, régulière)
    
    soil_type = models.CharField(
        max_length=10,
        choices=[('argileux', 'Argileux'), ('sableux', 'Sableux'), ('limoneux', 'Limoneux')],
        default='argileux'
    )  # Type de sol (argileux, sableux, limoneux)
    
    # Résultats du diagnostic
    diagnosis_result = models.TextField()  # Résultat du diagnostic
    diagnosis_class = models.IntegerField()  # Classe du diagnostic (par exemple, type de maladie)
    diagnosis_confidence = models.FloatField()  # Confiance du diagnostic (probabilité)
    
    # Date et heure du diagnostic
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Diagnosis result for {self.tomato_image.name} on {self.timestamp}"

