# chatbot/views.py
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .gpt2_model import generate_response

@api_view(["POST"])
def chatbot_response(request):
    # Récupération du message envoyé par l'utilisateur
    user_input = request.data.get("message", "")

    # Validation : Vérifier si le message est vide
    if not user_input:
        return JsonResponse({"error": "Message vide"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Génération de la réponse par GPT-2
        response = generate_response(user_input)
        
        # Vérifier si la génération de la réponse a échoué ou est vide
        if not response:
            return JsonResponse({"error": "Aucune réponse générée, réessayez"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Retourner la réponse générée dans une structure propre
        return JsonResponse({"response": response}, status=status.HTTP_200_OK)
    
    except Exception as e:
        # En cas d'erreur serveur, retourner une erreur détaillée
        return JsonResponse({"error": f"Erreur du serveur : {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
