from djongo import models

class VideoRecommendation(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField(unique=True)  # Empêche les doublons
    thumbnail = models.URLField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    # Indexation pour MongoDB, si nécessaire
    class Meta:
        indexes = [
            models.Index(fields=['created_at'])  # Indexer pour optimiser les requêtes par date
        ]
