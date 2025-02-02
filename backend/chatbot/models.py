# chatbot/models.py
from django.db import models
import uuid

class Localite(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name

class Conversation(models.Model):
    user_id = models.CharField(max_length=255, unique=True, blank=True, null=True, default=uuid.uuid4)

    def __str__(self):
        return f"Conversation with user {self.user_id}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10)  # 'user' ou 'bot'
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} at {self.timestamp}"
