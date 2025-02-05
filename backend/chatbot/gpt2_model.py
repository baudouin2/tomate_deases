import spacy
import json
import re
from functools import lru_cache

# Chargement du modèle NLP français
nlp = spacy.load('fr_core_news_md')

@lru_cache(maxsize=10)
def charger_donnees_maladies():
    with open('C:/Users/BAUDOUIN/Desktop/tomate_deases/backend/output_data.json', 'r', encoding='utf-8') as fichier:
        return json.load(fichier)

# Chargement des données de maladies
donnees_maladies = charger_donnees_maladies()

# Listes des maladies et des types d'informations connus
maladies_connues = list(donnees_maladies.keys())
types_infos_connus = ['description', 'causes', 'conséquences', 'symptômes', 'prevention', 'traitement']

def extraire_mots_cles(message_utilisateur):
    """
    Extraction de la maladie et du type d'information à partir du message utilisateur.
    
    Args:
        message_utilisateur (str): Message de l'utilisateur.

    Returns:
        tuple: (maladie, type_information, ambiguite_detectee)
    """
    doc = nlp(message_utilisateur.lower())

    maladies_detectees = [ent.text for ent in doc.ents if ent.text in maladies_connues]
    infos_detectees = [token.text for token in doc if token.text in types_infos_connus]

    maladie = maladies_detectees[0] if len(maladies_detectees) == 1 else None
    type_info = infos_detectees[0] if len(infos_detectees) == 1 else None

    ambiguite_detectee = len(maladies_detectees) > 1 or len(infos_detectees) > 1

    return maladie, type_info, ambiguite_detectee

def generer_reponse(message_utilisateur):
    maladie, type_info, ambiguite_detectee = extraire_mots_cles(message_utilisateur)

    if ambiguite_detectee:
        maladie = 'saine'
        type_info = type_info or 'description'

    if not maladie:
        suggestions = ", ".join(maladies_connues[:3])
        return f"Pouvez-vous préciser la maladie ? Peut-être parlez-vous de : {suggestions} ?"

    if not type_info:
        suggestions_info = ", ".join(types_infos_connus)
        return f"Quel type d'information souhaitez-vous ? (ex : {suggestions_info})"

    contenu = donnees_maladies.get(maladie, {}).get(f"{type_info}.txt", "")

    if not contenu:
        return "Désolé, je n'ai pas d'informations à ce sujet."

    phrases = [phrase.strip() for phrase in re.split(r'\n+', contenu) if phrase.strip()]
    reponse = " ".join(phrases[:3])

    return reponse[:100] + "..." if len(reponse) > 100 else reponse

# Exemple d'utilisation
if __name__ == "__main__":
    print(generer_reponse("Quels sont les symptômes de l'oïdium ou du mildiou ?"))
