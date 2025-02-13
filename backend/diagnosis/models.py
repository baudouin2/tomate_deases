from djongo import models

class DiseaseDiagnosis(models.Model):
    # Image de la tomate pour le diagnostic (utilise un champ FileField pour MongoDB)
    tomato_image = models.FileField(upload_to='tomato_images/')  # Utilisation de FileField au lieu de ImageField
    
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
    diagnosis_class = models.TextField(blank=False, null=False)  # Classe du diagnostic
    diagnosis_confidence = models.FloatField()  # Confiance du diagnostic (probabilité)
    
    # Date et heure du diagnostic
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Diagnosis result for {self.tomato_image.name} on {self.timestamp}"

    # Indexation pour MongoDB, si nécessaire
    class Meta:
        indexes = [
            models.Index(fields=['timestamp'])  # Optimiser les requêtes basées sur la date du diagnostic
        ]
