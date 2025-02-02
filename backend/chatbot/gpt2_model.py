# chatbot/gpt2_model.py
from transformers import pipeline

# Charger le modèle GPT-2 fine-tuné
chatbot_model = pipeline("text-generation", model="chemin/vers/ton_modele_gpt2")

def generate_response(user_input):
    response = chatbot_model(user_input, max_length=100, num_return_sequences=1)
    return response[0]["generated_text"]
