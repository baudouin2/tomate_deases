from django.core.cache import cache  # Ajout du cache pour la mémoire de conversation
import spacy
import re
import unicodedata
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from pymongo import MongoClient
from difflib import get_close_matches

nlp = spacy.load('fr_core_news_md')

TYPES_INFOS_CONNUS = {
    "description": ["description", "détails"],
    "cause": ["cause", "origine", "facteurs"],
    "conséquences": ["conséquences", "effets"],
    "symptômes": ["symptômes", "signes"],
    "prevention": ["prévention", "éviter"],
    "traitement": ["traitement", "soigner", "remède"]
}

MALADIES_CONNUES = [
    "Brûlure tardive de la tomate",
    "Brûlure précoce de la tomate",
    "Virus de mosaïque",
    "Déformation jaune des feuilles de tomates",
    "saines",
    "mildiou"
]

def obtenir_donnees_maladies():
    client = MongoClient('mongodb://localhost:27017/')  
    db = client['tomate_db']
    collection = db['maladies']

    donnees = {}
    for maladie in MALADIES_CONNUES:
        maladie_data = collection.find_one({"nom": maladie})
        if maladie_data:
            donnees[maladie] = maladie_data

    client.close()
    return donnees

DONNEES_MALADIES = obtenir_donnees_maladies()

def trouver_proche(mot, liste):
    correspondance = get_close_matches(mot, liste, n=1, cutoff=0.7)
    return correspondance[0] if correspondance else None

def extraire_mots_cles(message, user_id):
    doc = nlp(message.lower())

    maladies_detectees = []
    for token in doc:
        maladie_proche = trouver_proche(token.text, MALADIES_CONNUES)
        if maladie_proche:
            maladies_detectees.append(maladie_proche)

    infos_detectees = []
    for token in doc:
        for type_info, synonymes in TYPES_INFOS_CONNUS.items():
            if token.text in synonymes:
                infos_detectees.append(type_info)

    if not maladies_detectees:
        last_maladie = cache.get(f"user_{user_id}_last_maladie")
        if last_maladie:
            maladies_detectees.append(last_maladie)

    return (
        maladies_detectees[0] if len(maladies_detectees) == 1 else None,
        infos_detectees[0] if len(infos_detectees) == 1 else None,
        len(maladies_detectees) > 1 or len(infos_detectees) > 1
    )

def generer_reponse(message, user_id):
    maladie, type_info, ambiguite = extraire_mots_cles(message, user_id)

    if ambiguite:
        return "Votre demande est ambiguë. Pouvez-vous préciser votre question ?"

    if maladie:
        cache.set(f"user_{user_id}_last_maladie", maladie, timeout=300)  # Sauvegarde de la dernière maladie pendant 5 min

    if not maladie:
        return "Parlez-vous de 'Mildiou' ou 'Brûlure précoce' ?"

    if not type_info:
        return f"Voulez-vous en savoir plus sur la description, les causes ou le traitement de {maladie} ?"

    contenu = DONNEES_MALADIES.get(maladie, {}).get(type_info, "Je ne trouve pas cette information.")
    return contenu if contenu else "Désolé, je n'ai pas d'informations précises sur ce sujet."

@api_view(["POST"])
def chatbot_response(request):
    user_input = request.data.get("message", "").strip()
    user_id = request.data.get("user_id", "default_user")  # Identifiant de l'utilisateur (à adapter selon ton système)

    if not user_input:
        return JsonResponse({"error": "Message vide"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        response = generer_reponse(user_input, user_id)

        if not response:
            return JsonResponse({"error": "Aucune réponse générée, réessayez"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return JsonResponse({"response": response}, status=status.HTTP_200_OK)

    except Exception as e:
        return JsonResponse({"error": f"Erreur du serveur : {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
