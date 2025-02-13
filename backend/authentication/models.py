from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, full_name, password=None, **extra_fields):
        if not full_name:
            raise ValueError("Le nom complet est obligatoire")

        extra_fields.pop("username", None)

        user = self.model(full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(full_name, password, **extra_fields)

class CustomUser(AbstractUser):
    username = None  # Supprimer le champ `username`
    full_name = models.CharField(max_length=255, unique=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'full_name'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.full_name
