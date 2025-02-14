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
    "description": ["description", "détails", "decrit", "explique", "explication"],
    "cause": ["cause", "origine", "facteurs"],
    "conséquences": ["conséquences", "effets"],
    "symptômes": ["symptômes", "signes", "manifestations"],
    "prevention": ["prévention", "éviter", "prevenir", "esquiver"],
    "traitement": ["traitement", "soigner", "remède", "traiter", "eradiquer", "eradication"]
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
        maladies_detectees,  # Liste des maladies détectées
        infos_detectees,     # Liste des types d'informations détectées
    )

def generer_reponse(message, user_id):
    """Génère une réponse en fonction du message et de l'identifiant de l'utilisateur."""
    message = message.lower().strip()

    # Cas spécifique : L'utilisateur veut tout savoir sur la tomate (formulations variées)
    if any(phrase in message for phrase in [
        "tout savoir sur la tomate", "tout sur la tomate", "informations complètes sur la tomate",
        "détails sur toutes les maladies de la tomate", "savoir tout sur les maladies de la tomate",
        "donne-moi tout sur la tomate", "tout ce qu'il faut savoir sur la tomate"
    ]):
        return generer_reponse_tout_savoir()

    # Extraire les maladies et types d'informations du message
    maladies, types_info = extraire_mots_cles(message, user_id)

    if not maladies and not types_info:
        return "Aucune maladie ou information spécifique détectée. Pouvez-vous préciser ?"

    # Mise à jour du cache uniquement si une maladie spécifique est détectée
    if maladies:
        cache.set(f"user_{user_id}_last_maladie", maladies[0], timeout=300)  # Mise à jour de la maladie
    else:
        # Si aucune maladie spécifique n'est trouvée, on peut utiliser la dernière maladie du cache si nécessaire
        last_maladie = cache.get(f"user_{user_id}_last_maladie")
        if last_maladie:
            maladies.append(last_maladie)  # Utilisation de la dernière maladie si nécessaire

    if types_info:
        cache.set(f"user_{user_id}_last_type_info", types_info[0], timeout=300)  # Mise à jour du type d'info

    # Gestion des multiples maladies et informations
    reponses = []

    if not types_info:
        for maladie in maladies:
            reponses.append(f"Voulez-vous en savoir plus sur la description, les causes ou le traitement de {maladie} ?")
    else:
        for maladie in maladies:
            for type_info in types_info:
                contenu = DONNEES_MALADIES.get(maladie, {}).get(type_info, "Je ne trouve pas cette information.")
                reponses.append(contenu if contenu else f"Désolé, je n'ai pas d'informations sur {maladie} pour ce type.")

    return " ".join(reponses)

def generer_reponse_tout_savoir():
    """Retourne toutes les informations disponibles sur toutes les maladies liées à la tomate."""
    reponses = []
    
    for maladie in MALADIES_CONNUES:
        reponses.append(f"Pour {maladie}, voici toutes les informations disponibles :")
        for type_info in TYPES_INFOS_CONNUS.keys():
            contenu = DONNEES_MALADIES.get(maladie, {}).get(type_info, f"Aucune information disponible pour {type_info}.")
            reponses.append(f"- {type_info.capitalize()}: {contenu}")
    
    return "\n".join(reponses)

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
