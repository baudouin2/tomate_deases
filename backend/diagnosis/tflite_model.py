# diagnostic/tflite_model.py
import tensorflow.lite as tflite
import numpy as np
from PIL import Image

# Initialisation de l'interpréteur TensorFlow Lite
interpreter = tflite.Interpreter(model_path="backend/model_tomates.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

import numpy as np
from PIL import Image
import matplotlib.pyplot as plt

def predict_disease(model, image_path, context_data, label_encoder, one_hot_encoder, scaler, target_size=(128, 128)):
    # Charger et afficher l'image
    img = Image.open(image_path).resize(target_size)  # Redimensionner l'image à la taille cible
    img_array = np.array(img, dtype=np.float32) / 255.0  # Normalisation de l'image
    img_array = np.expand_dims(img_array, axis=0)  # Ajouter une dimension pour le batch

    # Affichage de l'image sur laquelle la prédiction est effectuée
    plt.imshow(img)
    plt.title("Image sur laquelle la prédiction est effectuée")
    plt.axis('off')  # Masquer les axes
    plt.show()

    # Prétraitement des données contextuelles
    numeric_data = np.array(context_data[:2]).reshape(1, -1)  # Humidité et Température
    categorical_data = np.array(context_data[2:]).reshape(1, -1)  # Ombrage, Densité, Fréquence d'irrigation, etc.
    categorical_encoded = one_hot_encoder.transform(categorical_data).toarray()  # Encodage one-hot
    numeric_scaled = scaler.transform(numeric_data)  # Mise à l'échelle des données numériques
    context_array = np.hstack((numeric_scaled, categorical_encoded))  # Fusion des données numériques et catégorielles

    # Effectuer une prédiction avec le modèle
    predictions = model.predict([img_array, context_array])  # Utiliser le modèle pour prédire
    predicted_class = np.argmax(predictions, axis=1)  # Classe prédite (avec la plus grande probabilité)
    predicted_label = label_encoder.inverse_transform(predicted_class)  # Retourner l'étiquette correspondante

    # Retourner l'étiquette de la classe prédite et les probabilités
    return predicted_label[0], predictions
