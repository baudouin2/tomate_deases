from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from PIL import Image
import numpy as np
import tensorflow as tf
import joblib
import traceback
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from .models import DiseaseDiagnosis
from pymongo import MongoClient

# Connexion à la base de données MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['tomate_db']
collection = db['maladies']

# Définition des chemins des fichiers
import os

def get_current_directory():
    # Récupérer le chemin absolu du répertoire où le script est exécuté
    current_directory = os.path.dirname(os.path.abspath(__file__))
    
    # Remplacer les antislashs par des barres obliques
    return current_directory.replace(os.sep, '/')

# Utilisation de la fonction get_current_directory pour obtenir le répertoire actuel
current_directory = get_current_directory()

# Créer les chemins relatifs
MODEL_PATHS = {
    "model": os.path.join(current_directory, "model_tomates.tflite").replace(os.sep, '/'),
    "one_hot_encoder": os.path.join(current_directory, "onehot_encoder.pkl").replace(os.sep, '/'),
    "label_encoder": os.path.join(current_directory, "label_encoder.pkl").replace(os.sep, '/'),
    "scaler": os.path.join(current_directory, "scaler.pkl").replace(os.sep, '/')
}

# Chargement des ressources
def load_resources():
    try:
        print("🔄 Chargement des modèles et encodeurs...")
        interpreter = tf.lite.Interpreter(model_path=MODEL_PATHS["model"])
        interpreter.allocate_tensors()

        one_hot_encoder = joblib.load(MODEL_PATHS["one_hot_encoder"])
        label_encoder = joblib.load(MODEL_PATHS["label_encoder"])
        scaler = joblib.load(MODEL_PATHS["scaler"])

        print("✅ Ressources chargées avec succès.")
        return interpreter, label_encoder, one_hot_encoder, scaler
    except Exception as e:
        print(f"❌ Erreur lors du chargement : {e}")
        raise

interpreter, label_encoder, one_hot_encoder, scaler = load_resources()

def preprocess_image(image_file, target_size=(128, 128)):
    """ Prétraiter l'image directement depuis le fichier sans la stocker. """
    try:
        image = Image.open(image_file).convert("RGB").resize(target_size)
        return np.expand_dims(np.array(image, dtype=np.float32) / 255.0, axis=0)
    except Exception as e:
        print(f"❌ Erreur image : {e}")
        raise

def preprocess_context_data(context_data):
    """ Prétraiter les données contextuelles (numériques et catégoriques). """
    try:
        if len(context_data) < 6:
            raise ValueError("6 éléments attendus dans les données contextuelles.")
        
        numeric_data = np.array(context_data[:2], dtype=np.float32).reshape(1, -1)
        categorical_data = np.array(context_data[2:]).reshape(1, -1)
        
        numeric_scaled = scaler.transform(numeric_data)
        categorical_encoded = one_hot_encoder.transform(categorical_data).toarray()
        
        return np.hstack((numeric_scaled, categorical_encoded))
    except Exception as e:
        print(f"❌ Erreur prétraitement contexte : {e}")
        raise

def predict(image_file, context_data):
    """ Effectuer une prédiction en utilisant l'image et les données contextuelles. """
    try:
        image_array = preprocess_image(image_file)
        context_array = preprocess_context_data(context_data)
        
        input_details = interpreter.get_input_details()
        
        interpreter.set_tensor(input_details[0]['index'], context_array.astype(np.float32))
        interpreter.set_tensor(input_details[1]['index'], image_array.astype(np.float32))
        interpreter.invoke()
        
        predictions = interpreter.get_tensor(interpreter.get_output_details()[0]['index'])
        predicted_class = np.argmax(predictions, axis=1)
        predicted_label = label_encoder.inverse_transform(predicted_class)[0]
        
        return predicted_label, float(predictions[0][predicted_class][0]) * 100
    except Exception as e:
        print(f"❌ Erreur prédiction : {e}")
        print(traceback.format_exc())
        raise

@csrf_exempt
def diagnose_disease(request):
    """ Diagnostiquer la maladie sans stocker l'image avant l'inférence. """
    if request.method != 'POST':
        return JsonResponse({'error': 'Méthode non supportée'}, status=405)
    
    try:
        data_keys = ['humidity', 'temperature', 'shading_level', 'plantation_density', 'irrigation_frequency', 'soil_type']
        data = {key: request.POST.get(key) for key in data_keys}
        image = request.FILES.get('image')

        if not image or not all(data.values()):
            return JsonResponse({'error': 'Données incomplètes'}, status=400)

        # Extraire les données contextuelles
        context_data = list(data.values())

        # Faire la prédiction sans stocker l'image
        predicted_label, confidence = predict(image, context_data)

        # Vérification si la confiance est faible
        if confidence < 50:
            predicted_label = "Aucune maladie de tomate détectée"
            recommendation = "Veuillez vous assurer que vous soumettez bien une image de feuille de tomate"
        else:
            # Extraire la recommandation depuis la base de données
            maladie_data = collection.find_one({"nom": predicted_label})
            recommendation = maladie_data.get("traitement", "Aucune recommandation trouvée")

        # Stocker l'image et les résultats après le diagnostic
        diagnosis = DiseaseDiagnosis.objects.create(
            tomato_image=image,  # Stockage uniquement après inférence
            **data,
            diagnosis_result=f"Class: {predicted_label}, Confidence: {confidence:.2f}%",
            diagnosis_class=predicted_label,
            diagnosis_confidence=confidence
        )
        
        return JsonResponse({
            'diagnosis': {
                'class': predicted_label,
                'confidence': confidence,
                'id': diagnosis.id,
                'recommendation': recommendation
            }
        })
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({'error': f'Erreur : {str(e)}'}, status=500)
