# API Projet Vente de Meubles

Bienvenue sur l'API du projet de vente de meubles. Cette API RESTful est construite avec Node.js, Express et TypeScript. Elle gère les utilisateurs, les annonces de meubles, les images et les paiements via Stripe.

## 🚀 Technologies utilisées

- **Node.js** & **Express** : Framework serveur.
- **TypeScript** : Langage de programmation typé.
- **SQLite** : Base de données relationnelle.
- **Argon2** : Hachage sécurisé des mots de passe.
- **JWT (JSON Web Tokens)** : Authentification et gestion des sessions.
- **Stripe** : Gestion des paiements.
- **Multer** : Gestion de l'upload d'images.

## 📋 Prérequis

Assurez-vous d'avoir installé :
- [Node.js](https://nodejs.org/) (version recommandée : LTS)
- [npm](https://www.npmjs.com/)

## 🛠️ Installation

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/Merwann-tech/API_projet_vente_de_meubles.git
   cd API_projet_vente_de_meubles
   ```

2. **Installer les dépendances :**

   ```bash
   npm install
   ```

3. **Configuration de l'environnement :**

   Créez un fichier `.env` à la racine du projet et configurez les variables nécessaires (exemple) :

   ```env
   PORT=3000
   # Ajoutez ici vos clés Stripe, secrets JWT, etc.
   ```

4. **Initialisation de la base de données :**

   Le projet utilise SQLite. Vous pouvez initialiser la base de données en exécutant le script SQL situé dans `sql/schema.sql`.

## ▶️ Démarrage

### Mode Développement

Pour lancer le serveur avec rechargement automatique (nodemon) :

```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000` (ou le port défini dans votre `.env`).

### Mode Production

1. **Compiler le projet :**

   ```bash
   npm run build
   ```

2. **Lancer le serveur :**

   ```bash
   npm start
   ```

## 📚 Documentation de l'API

Voici les principaux points de terminaison (endpoints) disponibles :

### 👤 Utilisateurs (`/users`)
- Gestion des comptes utilisateurs (inscription, modification, suppression).
- Rôles : Utilisateur standard, Modérateur, Administrateur.

### 🔑 Authentification (`/login`, `/token`)
- Connexion utilisateur.
- Gestion et rafraîchissement des tokens JWT.

### 🪑 Meubles (`/furnitures`)
- **GET** : Lister les meubles (avec filtres par type, couleur, matériau, ville, etc.).
- **POST** : Créer une nouvelle annonce de meuble.
- **PUT/DELETE** : Modifier ou supprimer une annonce.
- Gestion des statuts : `attente de validation`, `valider`, `refuser`, `vendu`.

### 🖼️ Images (`/images`)
- Upload et gestion des images associées aux meubles.

### 💳 Paiement (`/strip`)
- Intégration avec Stripe pour le paiement des meubles.

## 🗄️ Structure de la Base de Données

Le schéma de la base de données comprend les tables suivantes :
- `users` : Informations utilisateurs.
- `furnitures` : Annonces de meubles.
- `images` : URLs des images des meubles.
- `cities`, `colors`, `furnitures_type`, `furnitures_materials`, `furnitures_status` : Tables de référence pour la normalisation des données.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une "Issue" ou à soumettre une "Pull Request".

## 📝 Licence

Ce projet est sous licence ISC.