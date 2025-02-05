# diagnostic/tflite_model.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from .models import DiseasePrediction  # Ajustez en fonction de votre modèle

@csrf_exempt
def predict_disease(request):
    if request.method == 'POST':
        # Vérifier si une image a été envoyée
        image = request.FILES.get('image')
        if not image:
            return JsonResponse({'error': 'Aucune image reçue'}, status=400)

        # Enregistrer l'image sur le serveur
        image_path = default_storage.save(f"images/{image.name}", image)
        full_image_path = default_storage.url(image_path)

        # Traitement de l'image et prédiction
        predicted_label, predictions = predict_disease_logic(full_image_path)

        # Retourner la réponse avec les résultats de la prédiction
        return JsonResponse({
            'class': predicted_label,
            'confidence': predictions[0]
        })
    else:
        return JsonResponse({'error': 'Méthode HTTP non supportée'}, status=405)

def predict_disease_logic(image_path):
    # Chargez l'image, effectuez la prédiction avec TensorFlow Lite, etc.
    img = Image.open(image_path).resize((128, 128))  # Redimensionner à la taille attendue
    img_array = np.array(img) / 255.0  # Normalisation
    img_array = np.expand_dims(img_array, axis=0)  # Ajouter une dimension pour le batch

    # Faites la prédiction avec votre modèle
    predictions = interpreter.get_output_details()[0].predict(img_array)

    predicted_class = np.argmax(predictions, axis=1)
    predicted_label = label_encoder.inverse_transform(predicted_class)  # Retourner l'étiquette correspondante

    # Retourner l'étiquette de la classe prédite et les probabilités
    return predicted_label[0], predictions
