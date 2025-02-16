# 📌 Application Mobile de Diagnostic et d'Assistance pour la Culture de la Tomate

## 📖 Description du Projet
Cette application mobile vise à aider les cultivateurs de tomates en leur fournissant :
1. **Un système d'authentification sécurisé** basé sur le nom complet et un mot de passe à 5 chiffres.
2. **Un diagnostic de maladies des tomates** grâce à un modèle d'intelligence artificielle, qui analyse une image de feuille de tomate et détecte des pathologies spécifiques.
3. **Des vidéos éducatives** pour informer les cultivateurs sur les bonnes pratiques agricoles.
4. **Un chatbot interactif**, capable de répondre aux questions sur les maladies et fournir des conseils pratiques.

L'application est développée avec **Django Rest Framework (DRF) pour le backend** et **React Native (Expo) pour le frontend**. Les images sont traitées avant stockage pour optimiser l'expérience utilisateur.

---

## 🛠️ Technologies Utilisées
### 🔹 Backend
- **Django** avec **Django Rest Framework (DRF)** pour l'API
- **MongoDB** comme base de données
- **TensorFlow** pour l'inférence du modèle de diagnostic
- **JWT** pour l'authentification

### 🔹 Frontend
- **React Native (Expo)** pour le développement mobile
- **Axios** pour les requêtes API
- **AsyncStorage** pour la gestion du token d'authentification

---

## 🚀 Installation et Lancement
### 🔹 1. Cloner le projet
```bash
git clone https://github.com/ton-repo/application-tomate.git
cd application-tomate
```

### 🔹 2. Installation du Backend (Django)
1. **Créer un environnement virtuel et l’activer** :
```bash
python -m venv env
source env/bin/activate  # Pour macOS/Linux
env\Scripts\activate  # Pour Windows
```

2. **Installer les dépendances** :
```bash
pip install -r requirements.txt
```

3. **Démarrer le serveur Django** :
```bash
python manage.py runserver
```

### 🔹 3. Installation du Frontend (React Native)
1. **Se rendre dans le dossier frontend** :
```bash
cd frontend
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Lancer l’application Expo** :
```bash
npx expo start
```

---

## 🔑 Authentification
- **Inscription et connexion** se font avec un `full_name` et un `password` à 5 chiffres.
- **Un token JWT** est stocké en local pour gérer les sessions utilisateurs.

---

## 📡 Endpoints API Principaux
| Méthode | Endpoint | Description |
|---------|----------------------|------------------------------------------------|
| `POST`  | `/api/authentication/authentication/` | Inscription et connexion |
| `POST`  | `/api/diagnosis/diagnosis/` | Envoi d'une image pour diagnostic |
| `GET`   | `/api/youtube/youtube/` | Récupération des recommandations vidéo |
| `POST`  | `/api/chatbot/chatbot/` | Envoi d'un message au chatbot |

---

## ✅ Fonctionnalités à venir
- 📍 **Localisation pour les recommandations personnalisées**
- 🌱 **Suggestions de traitements biologiques**
- 📊 **Tableau de bord des diagnostics précédents**

---

## 📩 Contact
Si vous avez des questions ou souhaitez contribuer, n'hésitez pas à nous contacter à **[email@example.com](mailto:email@example.com)**.

🚀 Bon développement !

