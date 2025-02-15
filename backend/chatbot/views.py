from django.core.cache import cache  # Cache pour la mémoire de conversation
import spacy
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from pymongo import MongoClient
from difflib import get_close_matches

# Chargement du modèle NLP une seule fois
nlp = spacy.load('fr_core_news_md')

# Dictionnaire des types d'informations
TYPES_INFOS_CONNUS = {
    "description": ["description", "détails", "decrit", "explique", "explication", "caractéristiques", "infos", "résumé", "overview", "situation", "contexte"],
    "cause": ["cause", "origine", "facteurs", "raisons", "déclencheurs", "motif", "provoque", "origine", "source"],
    "conséquences": ["conséquences", "effets", "répercussions", "impact", "dommages", "résultats", "effets secondaires", "dérivés", "résultats"],
    "symptômes": ["symptômes", "signes", "manifestations", "indications", "manifestation", "caractéristiques visibles", "symptômes cliniques", "affectations", "traces", "indices"],
    "prevention": ["prévention", "éviter", "prevenir", "esquiver", "protection", "préserver", "protéger", "préserve", "éviter"],
    "traitement": ["traitement", "soigner", "remède", "traiter", "eradiquer", "eradication", "guérison", "médicament", "soins", "intervention", "solution", "remède naturel", "thérapie"]
}

# Liste des maladies et leurs synonymes
MALADIES_CONNUES = {
    "Brûlure tardive de la tomate": ["brûlure tardive", "brûlure de la tomate", "late blight", "Phytophthora infestans"],
    "Brûlure précoce de la tomate": ["brûlure précoce", "early blight", "Alternaria solani", "tache brune précoce"],
    "Virus de mosaïque": ["virus de mosaïque", "mosaic virus", "mosaïque", "Tomato mosaic virus", "TMV"],
    "Déformation jaune des feuilles de tomates": ["déformation jaune des feuilles", "feuilles jaunes déformées", "yellow leaf curl", "tache jaune", "yellowing leaf deformation"],
    "Saines": ["saines", "en bonne santé", "feuilles saines", "tomates saines"],
    "Mildiou": ["mildiou", "downy mildew", "Pseudoperonospora cubensis", "mildiou de la tomate", "tomato downy mildew"]
}


# Utilisation du cache pour éviter des requêtes MongoDB fréquentes
def obtenir_donnees_maladies():
    donnees = cache.get("donnees_maladies")
    if not donnees:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['tomate_db']
        collection = db['maladies']
        donnees = {maladie: collection.find_one({"nom": maladie}) for maladie in MALADIES_CONNUES}
        client.close()
        cache.set("donnees_maladies", donnees, timeout=3600)  # Mise en cache pour 1 heure
    return donnees

DONNEES_MALADIES = obtenir_donnees_maladies()

def extraire_mots_cles(message, user_id):
    # Le texte est transformé en minuscules et lemmatisé pour capter les racines
    doc = nlp(message.lower())

    maladies_detectees = set()
    infos_detectees = set()

    racines_maladies = {maladie.lower(): maladie for maladie in MALADIES_CONNUES}

    # Extraction des racines des mots dans le message
    tokens_lemmes = {token.lemma_ for token in doc}

    # Recherche de maladies connues
    for token_lem in tokens_lemmes:
        for maladie_racine, maladie in racines_maladies.items():
            if get_close_matches(token_lem, maladie_racine.split(), n=1, cutoff=0.8):
                maladies_detectees.add(maladie)

    # Recherche des types d'informations
    for token_lem in tokens_lemmes:
        for type_info, synonymes in TYPES_INFOS_CONNUS.items():
            if token_lem in synonymes:
                infos_detectees.add(type_info)

    # Si aucune maladie n'est détectée, on récupère les dernières valeurs depuis le cache
    if not maladies_detectees:
        maladies_detectees = cache.get(f"user_{user_id}_last_maladies", [])
    if not infos_detectees:
        infos_detectees = cache.get(f"user_{user_id}_last_infos", [])

    # Mise à jour du cache seulement si une maladie a été détectée
    if maladies_detectees:
        cache.set(f"user_{user_id}_last_maladies", list(maladies_detectees), timeout=500)
    if infos_detectees:
        cache.set(f"user_{user_id}_last_infos", list(infos_detectees), timeout=500)

    return list(maladies_detectees), list(infos_detectees)

def generer_reponse(message, user_id):
    maladies, types_info = extraire_mots_cles(message, user_id)
    
    if not maladies:
        return "Je n'ai pas détecté de maladie. Pouvez-vous préciser ?"
    
    if not types_info:
        return f"Voulez-vous en savoir plus sur la description, les causes ou le traitement de {', '.join(maladies)} ?"
    
    # Optimisation : générer toutes les réponses en une seule passe
    reponses = []
    for maladie in maladies:
        for type_info in types_info:
            reponse = DONNEES_MALADIES.get(maladie, {}).get(type_info, f"Aucune information trouvée pour {maladie} - {type_info}.")
            reponses.append(reponse)
    
    return " ".join(reponses)

@api_view(["POST"])
def chatbot_response(request):
    user_input = request.data.get("message", "").strip()
    user_id = request.data.get("user_id", "default_user")
    
    if not user_input:
        return JsonResponse({"error": "Message vide"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        response = generer_reponse(user_input, user_id)
        return JsonResponse({"response": response}, status=status.HTTP_200_OK)
    except Exception as e:
        return JsonResponse({"error": f"Erreur du serveur : {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
