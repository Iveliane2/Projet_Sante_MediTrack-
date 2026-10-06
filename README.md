# Projet Santé Medi Track

Ce projet contient un backend Laravel API et un frontend React pour gérer les patients, diagnostics, traitements et rendez-vous d'un système de santé.

## Structure du projet

### Backend Laravel
```text
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   └── Requests/
│   ├── Models/
│   ├── Services/
│   ├── Repositories/
│   └── Policies/
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php
│   ├── web.php
│   └── console.php
├── public/
├── resources/
│   ├── css/
│   ├── js/
│   └── views/
├── storage/
└── tests/
```

### Frontend React/Vite
```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

### Rôle des dossiers
- `backend/app/Http/Controllers/Api` : contrôleurs de l'API
- `backend/app/Models` : modèles Eloquent
- `backend/app/Services` : logique métier
- `backend/app/Repositories` : accès aux données
- `backend/app/Policies` : autorisations et rôles
- `frontend/src/pages` : pages React
- `frontend/src/components` : composants réutilisables
- `frontend/src/services` : appels API Axios
- `frontend/src/contexts` : contexte auth/global
- `frontend/src/routes` : configuration des routes

## Prérequis

- PHP 8.2+
- Composer
- Node.js 18+ / npm
- MySQL (ou autre base de données compatible Laravel)

## Installation backend

1. Ouvrir un terminal dans `backend/`
2. Installer les dépendances :
   ```bash
   composer install
   ```
3. Copier l'environnement :
   ```bash
   cp .env.example .env
   ```
4. Configurer la base de données dans `.env`
5. Générer la clé d'application :
   ```bash
   php artisan key:generate
   ```
6. Lancer les migrations :
   ```bash
   php artisan migrate
   ```
7. Seed la base de données :
   ```bash
   php artisan db:seed
   ```

## Installation frontend

1. Ouvrir un terminal dans `frontend/`
2. Installer les dépendances :
   ```bash
   npm install
   ```

## Exécution locale

### Backend

```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

### Frontend

```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

### Application mobile patient

Le dossier `mobile/` contient l'application Flutter destinée aux patients : connexion Sanctum, tableau de bord, rendez-vous, traitements, profil et déconnexion persistée.

```bash
cd mobile
flutter pub get
flutter run
```

Par défaut, l'émulateur Android utilise `http://10.0.2.2:8000/api`. Pour un téléphone physique ou une autre adresse backend, fournir l'URL avec `--dart-define` :

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:8000/api
```

Le backend Laravel doit être lancé avec `php artisan serve --host=0.0.0.0 --port=8000` pour être accessible depuis un appareil du réseau local.

## API disponibles

- `POST /api/register`
- `POST /api/login`
- `GET /api/patients`
- `GET /api/diagnostics`
- `GET /api/rendezvous`
- `GET /api/traitements`

> Les routes `patients`, `diagnostics`, `rendezvous` et `traitements` sont protégées et requièrent un token Sanctum.

## Pages React

- `/login`
- `/`
- `/patients`
- `/diagnostics`
- `/rendezvous`
- `/traitements`

## Compte de test

- Email : `jean@example.com`
- Mot de passe : `password123`

## Remarques

- Le backend utilise Laravel Sanctum pour l'authentification API.
- Le frontend utilise Axios pour les requêtes et React Router pour la navigation.
- Le token est stocké dans `localStorage` pour maintenir la session.
