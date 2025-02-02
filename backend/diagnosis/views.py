from django.http import JsonResponse
from rest_framework.decorators import api_view
from .tflite_model import predict_disease  # Assurez-vous que la fonction predict_disease est importée correctement
from .models import DiseaseDiagnosis

@api_view(["POST"])
def diagnose_disease(request):
    # Récupération de l'image et des données contextuelles
    image = request.FILES.get("image")
    humidity = request.data.get("humidity")
    temperature = request.data.get("temperature")
    soil_type = request.data.get("soil_type")
    shading_level = request.data.get("shading_level")
    plantation_density = request.data.get("plantation_density")
    irrigation_frequency = request.data.get("irrigation_frequency")

    # Vérification des paramètres requis
    if not image:
        return JsonResponse({"error": "Image requise"}, status=400)
    
    if not humidity or not temperature or not soil_type or not shading_level or not plantation_density or not irrigation_frequency:
        return JsonResponse({"error": "Toutes les données contextuelles (humidite, temperature, sol, ombrage, densite plantation, irrigation) sont requises"}, status=400)

    # Convertir l'image en chemin ou en format utilisable par la fonction predict_disease
    image_path = image.path  # Si l'image est téléchargée et stockée, vous pouvez récupérer son chemin
    
    # Structure des données contextuelles sous forme de tableau
    context_data = [
        humidity,
        temperature,
        shading_level,
        plantation_density,
        irrigation_frequency,
        soil_type
        
    ]

    # Effectuer le diagnostic de la maladie
    try:
        result = predict_disease(
            model=request.data.get("model"),  # Assurez-vous de spécifier le modèle si nécessaire
            image_path=image_path,
            context_data=context_data,
            label_encoder=request.data.get("label_encoder"),  # Vérifiez si vous devez envoyer un encodeur ici
            one_hot_encoder=request.data.get("one_hot_encoder"),  # Vérifiez si vous devez envoyer un encodeur one-hot ici
            scaler=request.data.get("scaler")  # Vérifiez si vous devez envoyer un scaler ici
        )
    except Exception as e:
        return JsonResponse({"error": f"Erreur lors de la prédiction: {str(e)}"}, status=500)

    # Enregistrement du résultat dans la base de données
    diagnosis = DiseaseDiagnosis.objects.create(
        tomato_image=image,
        humidity=humidity,
        temperature=temperature,
        soil_type=soil_type,
        shading_level=shading_level,
        plantation_density=plantation_density,
        irrigation_frequency=irrigation_frequency,
        diagnosis_result=f"Class: {result[0]}, Confidence: {result[1].tolist()}",
        diagnosis_class=result[0],
        diagnosis_confidence=result[1].tolist()  # Convertir en liste si nécessaire
    )

    # Retourner la réponse avec le résultat du diagnostic
    return JsonResponse({
        "diagnosis": {
            "class": result[0],
            "confidence": result[1].tolist(),  # Convertir en liste pour l'affichage
            "id": diagnosis.id
        }
    })
