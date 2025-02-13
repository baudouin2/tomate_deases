from djongo import models  # Utilisation de Djongo pour MongoDB
import uuid

class Localite(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name

class Conversation(models.Model):
    user_id = models.CharField(max_length=255, unique=True, blank=True, null=True, default=str(uuid.uuid4))  # Génère un UUID comme chaîne

    def __str__(self):
        return f"Conversation with user {self.user_id}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10)  # 'user' ou 'bot'
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} at {self.timestamp}"

    # Assurez-vous de bien gérer l'indexation dans MongoDB pour la recherche rapide
    class Meta:
        indexes = [
            models.Index(fields=['conversation', 'timestamp'])  # Un index pour optimiser les requêtes basées sur la conversation et le timestamp
        ]
