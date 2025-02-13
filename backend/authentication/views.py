from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser

class UserAuthView(APIView):
    def post(self, request, *args, **kwargs):
        """Gère la connexion et l'inscription."""
        full_name = request.data.get('full_name')
        password = request.data.get('password')
        is_registering = request.data.get('register', False)
        
        if is_registering:
            return self.register_user(full_name, password)
        
        return self.login_user(full_name, password)

    def register_user(self, full_name, password):
        """Inscription avec un mot de passe défini par l'utilisateur."""
        if not full_name or not password:
            return Response({"detail": "Nom complet et mot de passe sont obligatoires"}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(str(password)) != 5 or not str(password).isdigit():
            return Response({"detail": "Le mot de passe doit être un entier à 5 chiffres"}, status=status.HTTP_400_BAD_REQUEST)
        
        if CustomUser.objects.filter(full_name=full_name).exists():
            return Response({"detail": "Nom d'utilisateur déjà utilisé"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = CustomUser.objects.create_user(
            username=full_name,  # Utilisé pour l'authentification
            full_name=full_name,
            password=password
        )
        
        return Response({
            'message': "Compte créé avec succès.",
            'full_name': user.full_name,
        }, status=status.HTTP_201_CREATED)

    def login_user(self, full_name, password):
        """Connexion avec `full_name` et un mot de passe à 5 chiffres."""
        if not password:
            return Response({"detail": "Mot de passe requis"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=full_name, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': str(user.id),  # Adapté pour MongoDB
                    'full_name': user.full_name,
                }
            }, status=status.HTTP_200_OK)
        
        return Response({"detail": "Identifiants incorrects"}, status=status.HTTP_400_BAD_REQUEST)
