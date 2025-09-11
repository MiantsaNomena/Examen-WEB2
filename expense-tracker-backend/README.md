# Expense Tracker Backend

Une API REST pour gérer les dépenses personnelles, construite avec Node.js, Express et PostgreSQL.

## Fonctionnalités

- 🔐 **Authentification JWT complète**
  - Inscription (signup)
  - Connexion (login) 
  - Profil utilisateur (me)
- 👤 **Gestion sécurisée des utilisateurs**
- 🛡️ **Middleware d'authentification**
- 📝 **Validation complète des données**
- 🌐 **API RESTful avec gestion d'erreurs**

## Prérequis

- Node.js (v14 ou plus)
- PostgreSQL (v12 ou plus)
- npm ou yarn

## Installation

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer PostgreSQL
Créez la base de données PostgreSQL :
```sql
-- Connectez-vous à PostgreSQL en tant que superuser
CREATE DATABASE personal_expense_tracker;
```

Puis exécutez le script d'initialisation :
```bash
psql -d personal_expense_tracker -f databases/database.sql
```

### 3. Configuration des variables d'environnement
```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos paramètres :
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=personal_expense_tracker
DB_USER=votre_nom_utilisateur
DB_PASSWORD=votre_mot_de_passe

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration (IMPORTANT: Changez cette clé !)
JWT_SECRET=votre_clé_secrète_jwt_très_sécurisée_et_longue
JWT_EXPIRES_IN=7d
```

## Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarrera sur `http://localhost:3000`

## 🌐 API Endpoints

### Base URL: `/api`

### 🔐 Authentication Routes

#### POST `/api/auth/signup`
**Description:** Créer un nouveau compte utilisateur  
**Auth Required:** ❌  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```
**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "nom": "user",
    "email": "user@example.com",
    "date_creation": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/login`
**Description:** Se connecter et obtenir un token JWT  
**Auth Required:** ❌  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```
**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "nom": "user",
    "email": "user@example.com",
    "date_creation": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/api/auth/me`
**Description:** Récupérer le profil de l'utilisateur authentifié  
**Auth Required:** ✅  
**Headers:** `Authorization: Bearer <token>`  
**Response (200):**
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "id": 1,
    "nom": "user",
    "email": "user@example.com",
    "date_creation": "2024-01-15T10:30:00.000Z"
  }
}
```

### 💸 Expense Routes

#### GET `/api/expenses`
**Description:** Récupérer la liste des dépenses de l'utilisateur  
**Auth Required:** ✅  
**Query Params (optionnels):**
- `start=YYYY-MM-DD` - Date de début
- `end=YYYY-MM-DD` - Date de fin  
- `category=food` - Filtrer par catégorie
- `type=recurring` ou `one-time` - Type de dépense
- `limit=50` - Nombre de résultats (défaut: 50)
- `offset=0` - Décalage pour pagination (défaut: 0)

**Response (200):**
```json
{
  "message": "Expenses retrieved successfully",
  "expenses": [...],
  "total": 25,
  "filters": { "start": "2024-01-01", "category": "food" },
  "pagination": { "limit": 50, "offset": 0 }
}
```

#### GET `/api/expenses/:id`
**Description:** Récupérer une dépense spécifique par ID  
**Auth Required:** ✅  
**Response (200):**
```json
{
  "message": "Expense retrieved successfully",
  "expense": {
    "id_transaction": 1,
    "montant": 45.50,
    "description": "Courses alimentaires",
    "date_transaction": "2024-01-15",
    "nom_categorie": "Alimentation"
  }
}
```

#### POST `/api/expenses`
**Description:** Créer une nouvelle dépense (avec reçu optionnel)  
**Auth Required:** ✅  
**Content Type:** `multipart/form-data`  
**Form Fields:**
- `amount`: number (requis)
- `date`: string ISO format (requis)
- `categoryId`: string UUID (optionnel)
- `description`: string (optionnel)
- `type`: "one-time" ou "recurring" (défaut: "one-time")
- `startDate`: string (requis pour recurring)
- `endDate`: string (optionnel pour recurring)
- `receipt`: file (optionnel - JPEG, PNG, PDF, max 5MB)

**Response (201):**
```json
{
  "message": "Expense created successfully",
  "expense": {
    "id_transaction": 1,
    "montant": 45.50,
    "type": "one-time",
    "receiptPath": "uploads/receipts/receipt-123456.jpg"
  }
}
```

#### PUT `/api/expenses/:id`
**Description:** Modifier une dépense existante  
**Auth Required:** ✅  
**Content Type:** `multipart/form-data`  
**Fields:** (mêmes que POST - tous optionnels)

#### DELETE `/api/expenses/:id`
**Description:** Supprimer une dépense  
**Auth Required:** ✅  
**Response (200):**
```json
{
  "message": "Expense deleted successfully",
  "expense": { ... }
}
```

### 💰 Income Routes

#### GET `/api/incomes`
**Description:** Lister tous les revenus de l'utilisateur  
**Auth Required:** ✅  
**Query Params (optionnels):**
- `start=YYYY-MM-DD` - Date de début
- `end=YYYY-MM-DD` - Date de fin
- `limit=50` - Nombre maximum de résultats (défaut: 50)
- `offset=0` - Décalage pour la pagination (défaut: 0)

**Response (200):**
```json
{
  "message": "Incomes retrieved successfully",
  "incomes": [
    {
      "id_transaction": 1,
      "montant": 5000,
      "date_transaction": "2025-08-01",
      "description": "Salary: Monthly salary",
      "type_transaction": "revenu"
    }
  ],
  "total": 1,
  "filters": { "start": null, "end": null },
  "pagination": { "limit": 50, "offset": 0 }
}
```

#### GET `/api/incomes/:id`
**Description:** Récupérer un revenu spécifique  
**Auth Required:** ✅  
**Response (200):**
```json
{
  "message": "Income retrieved successfully",
  "income": {
    "id_transaction": 1,
    "montant": 5000,
    "date_transaction": "2025-08-01",
    "description": "Salary: Monthly salary",
    "type_transaction": "revenu"
  }
}
```

#### POST `/api/incomes`
**Description:** Créer un nouveau revenu  
**Auth Required:** ✅  
**Request Body:**
```json
{
  "amount": 5000,
  "date": "2025-08-01",
  "source": "Salary",
  "description": "Monthly salary"
}
```

**Response (201):**
```json
{
  "message": "Income created successfully",
  "income": {
    "id_transaction": 1,
    "montant": 5000,
    "date_transaction": "2025-08-01",
    "description": "Salary: Monthly salary",
    "type_transaction": "revenu",
    "source": "Salary"
  }
}
```

#### PUT `/api/incomes/:id`
**Description:** Modifier un revenu existant  
**Auth Required:** ✅  
**Request Body:** (tous les champs sont optionnels)
```json
{
  "amount": 5500,
  "date": "2025-08-01",
  "source": "Salary",
  "description": "Monthly salary with bonus"
}
```

**Response (200):**
```json
{
  "message": "Income updated successfully",
  "income": { ... }
}
```

#### DELETE `/api/incomes/:id`
**Description:** Supprimer un revenu  
**Auth Required:** ✅  
**Response (200):**
```json
{
  "message": "Income deleted successfully",
  "income": { ... }
}
```

### 📂 Category Routes

#### GET `/api/categories`
**Description:** Lister toutes les catégories de l'utilisateur  
**Auth Required:** ✅  

**Response (200):**
```json
{
  "message": "Categories retrieved successfully",
  "categories": [
    {
      "id_categorie": 1,
      "nom": "Travel",
      "type_categorie": "depense",
      "id_utilisateur": 1
    }
  ],
  "total": 1
}
```

#### POST `/api/categories`
**Description:** Créer une nouvelle catégorie  
**Auth Required:** ✅  
**Request Body:**
```json
{
  "name": "Travel"
}
```

**Response (201):**
```json
{
  "message": "Category created successfully",
  "category": {
    "id_categorie": 1,
    "nom": "Travel",
    "type_categorie": "depense",
    "id_utilisateur": 1
  }
}
```

#### PUT `/api/categories/:id`
**Description:** Renommer une catégorie existante  
**Auth Required:** ✅  
**Request Body:**
```json
{
  "name": "Business Travel"
}
```

**Response (200):**
```json
{
  "message": "Category updated successfully",
  "category": {
    "id_categorie": 1,
    "nom": "Business Travel",
    "type_categorie": "depense",
    "id_utilisateur": 1
  }
}
```

#### DELETE `/api/categories/:id`
**Description:** Supprimer une catégorie (si elle n'est pas utilisée)  
**Auth Required:** ✅  
**Note:** La suppression est refusée si la catégorie est utilisée dans des transactions

**Response (200):**
```json
{
  "message": "Category deleted successfully",
  "category": { ... }
}
```

**Response (400) - Category in use:**
```json
{
  "error": "Category in use",
  "message": "Cannot delete category that is used in transactions. Please remove or reassign transactions first."
}
```

### 📊 Summary Routes

#### GET `/api/summary/monthly`
**Description:** Obtenir le résumé du mois actuel ou d'un mois spécifique  
**Auth Required:** ✅  
**Query Params (optionnels):**
- `month=YYYY-MM` - Mois spécifique (ex: 2025-08)

**Response (200):**
```json
{
  "message": "Monthly summary retrieved successfully",
  "period": "2025-08",
  "summary": {
    "income": {
      "total": 5000,
      "transactions": 2
    },
    "expenses": {
      "total": 3500,
      "transactions": 15
    },
    "balance": 1500,
    "savings_rate": "30.00"
  }
}
```

#### GET `/api/summary`
**Description:** Obtenir un résumé entre deux dates  
**Auth Required:** ✅  
**Query Params (requis):**
- `start=YYYY-MM-DD` - Date de début
- `end=YYYY-MM-DD` - Date de fin

**Response (200):**
```json
{
  "message": "Summary retrieved successfully",
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "summary": {
    "income": {
      "total": 5000,
      "transactions": 2,
      "by_category": {
        "Salary": { "total": 5000, "transactions": 1 }
      }
    },
    "expenses": {
      "total": 3500,
      "transactions": 15,
      "by_category": {
        "Food": { "total": 800, "transactions": 8 },
        "Transport": { "total": 200, "transactions": 4 }
      }
    },
    "balance": 1500,
    "savings_rate": "30.00"
  }
}
```

#### GET `/api/summary/alerts`
**Description:** Retourne une alerte si les dépenses dépassent les revenus du mois actuel  
**Auth Required:** ✅  

**Response (200) - With Alert:**
```json
{
  "alert": true,
  "message": "You've exceeded your monthly budget by $123.45",
  "current_month": "2025-08",
  "details": {
    "total_income": 5000,
    "total_expenses": 5123.45,
    "balance": -123.45,
    "spending_rate": "102.5"
  }
}
```

**Response (200) - No Alert:**
```json
{
  "alert": false,
  "message": null,
  "current_month": "2025-08",
  "details": {
    "total_income": 5000,
    "total_expenses": 3500,
    "balance": 1500,
    "spending_rate": "70.0"
  }
}
```

### 👤 User Profile Routes

#### GET `/api/user/profile`
**Description:** Obtenir les informations de profil de l'utilisateur authentifié  
**Auth Required:** ✅  

**Response (200):**
```json
{
  "message": "User profile retrieved successfully",
  "profile": {
    "id_utilisateur": 1,
    "nom": "John Doe",
    "email": "john@example.com",
    "date_creation": "2025-01-01T10:00:00.000Z",
    "accounts": [
      {
        "id_compte": 1,
        "nom": "Main Account",
        "type_compte": "courant",
        "solde": 1500.00
      }
    ]
  }
}
```

### 🧾 Receipt Routes

#### GET `/api/receipts/:idExpense`
**Description:** Télécharger ou visualiser le fichier de reçu associé à une dépense  
**Auth Required:** ✅  
**Note:** Vérifie que l'utilisateur possède la dépense avant d'autoriser l'accès au fichier

**Response (200):** Fichier binaire (image ou PDF)
- **Content-Type:** `image/jpeg`, `image/png`, ou `application/pdf`
- **Content-Disposition:** `inline` pour visualisation directe dans le navigateur

**Response (404):**
```json
{
  "error": "No receipt found",
  "message": "No receipt file is associated with this expense"
}
```

### Autres endpoints
- `GET /` - Informations sur l'API
- `GET /health` - Vérification de l'état du serveur

## Exemples d'utilisation

### Inscription
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "motdepasse123"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "motdepasse123"
  }'
```

### Récupérer le profil
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Créer une dépense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -F "amount=45.50" \
  -F "date=2024-01-15" \
  -F "description=Courses alimentaires" \
  -F "type=one-time" \
  -F "receipt=@/path/to/receipt.jpg"
```

### Récupérer les dépenses avec filtres
```bash
curl -X GET "http://localhost:3000/api/expenses?start=2024-01-01&end=2024-01-31&category=food" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Modifier une dépense
```bash
curl -X PUT http://localhost:3000/api/expenses/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -F "amount=50.00" \
  -F "description=Courses alimentaires modifiées"
```

### Visualiser un reçu
```bash
curl -X GET http://localhost:3000/api/receipts/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  --output receipt.jpg
```

### Visualiser un reçu dans le navigateur
```
http://localhost:3000/api/receipts/1
```
(Avec l'en-tête Authorization: Bearer TOKEN)

### Créer un revenu
```bash
curl -X POST http://localhost:3000/api/incomes \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "date": "2025-08-01",
    "source": "Salary",
    "description": "Monthly salary"
  }'
```

### Lister les revenus avec filtres
```bash
curl -X GET "http://localhost:3000/api/incomes?start=2025-01-01&end=2025-12-31&limit=10" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Modifier un revenu
```bash
curl -X PUT http://localhost:3000/api/incomes/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5500,
    "description": "Monthly salary with bonus"
  }'
```

### Créer une catégorie
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Travel"
  }'
```

### Lister les catégories
```bash
curl -X GET http://localhost:3000/api/categories \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Renommer une catégorie
```bash
curl -X PUT http://localhost:3000/api/categories/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business Travel"
  }'
```

### Obtenir le résumé mensuel
```bash
curl -X GET http://localhost:3000/api/summary/monthly \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Obtenir le résumé d'un mois spécifique
```bash
curl -X GET "http://localhost:3000/api/summary/monthly?month=2025-08" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Obtenir un résumé par période
```bash
curl -X GET "http://localhost:3000/api/summary?start=2025-01-01&end=2025-01-31" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Vérifier les alertes budgétaires
```bash
curl -X GET http://localhost:3000/api/summary/alerts \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Obtenir le profil utilisateur
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

## Structure du projet

```
expense-tracker-backend/
├── config/
│   └── database.js          # Configuration PostgreSQL
├── databases/
│   └── database.sql         # Script d'initialisation de la DB
├── middleware/
│   └── auth.js              # Middleware d'authentification JWT
├── models/
│   ├── User.js              # Modèle utilisateur
│   └── Expense.js           # Modèle transaction (renommé)
├── routes/
│   └── auth.js              # Routes d'authentification
├── .env.example             # Exemple de configuration
├── index.js                 # Point d'entrée de l'application
├── package.json             # Dépendances et scripts
└── README.md                # Documentation
```

## Sécurité

- ✅ **Mots de passe hachés** avec bcrypt (salt rounds: 10)
- ✅ **Authentification JWT** avec expiration configurable
- ✅ **Validation des données** d'entrée (email, mot de passe)
- ✅ **Protection contre les injections SQL** avec requêtes paramétrées
- ✅ **Gestion d'erreurs** détaillée avec messages appropriés
- ✅ **CORS** configuré pour les requêtes cross-origin

## Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de données relationnelle
- **bcrypt** - Hachage sécurisé des mots de passe
- **jsonwebtoken** - Authentification JWT
- **dotenv** - Gestion des variables d'environnement
- **cors** - Gestion des requêtes cross-origin
- **pg** - Driver PostgreSQL pour Node.js

## Base de données

Le projet utilise une base de données PostgreSQL avec les tables suivantes :
- `utilisateur` - Comptes utilisateurs
- `refresh_token` - Tokens de rafraîchissement (optionnel)
- `categorie` - Catégories de revenus/dépenses
- `compte` - Comptes financiers
- `transaction` - Transactions financières
- `budget` - Budgets par catégorie
- `objectif` - Objectifs d'épargne

## Démarrage rapide

1. **Installez PostgreSQL** et créez la base de données
2. **Copiez** `.env.example` vers `.env` et configurez
3. **Installez** les dépendances : `npm install`
4. **Initialisez** la base de données avec le script SQL
5. **Démarrez** le serveur : `npm run dev`

🚀 **Votre API est maintenant prête !** Testez les endpoints d'authentification pour commencer.
