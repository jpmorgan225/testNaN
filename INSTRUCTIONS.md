# Instructions de démarrage - testNaN

## 🚀 Démarrage rapide

### 1. Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```

Le backend démarre sur `http://localhost:5002`

### 2. Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

## 📋 Fonctionnalités

### Inscription (/register)
- Nom complet
- Email
- Mot de passe (min 6 caractères)
- ✅ Cookies httpOnly automatiques
- ✅ Redirection vers /groups

### Connexion (/login)
- Email
- Mot de passe
- ✅ Cookies httpOnly automatiques
- ✅ Redirection vers /groups

### Groupes (/groups)
- Créer un groupe
- Voir la liste des groupes
- Inviter des membres (lien)
- Accéder aux détails

### Détails groupe (/groups/:id)
- Voir les membres
- Créer des tâches
- Assigner des tâches
- Suivre le statut

## 🔧 Configuration

### Backend (.env déjà configuré)
- `MONGO_URI` : MongoDB Atlas
- `PORT` : 5002
- `ACCESS_TOKEN_SECRET` : Token JWT access
- `REFRESH_TOKEN_SECRET` : Token JWT refresh
- `FRONTEND_URL` : http://localhost:5173

### Frontend (vite.config.js)
- Proxy `/api` vers `http://localhost:5002`
- Pas de problème CORS

## 🎯 Routes API

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur (protégé)

### Groupes
- `GET /api/groups` - Liste des groupes (protégé)
- `POST /api/groups` - Créer un groupe (protégé)
- `GET /api/groups/:id` - Détails d'un groupe (protégé)
- `POST /api/groups/:id/invite` - Générer lien d'invitation (protégé)
- `GET /api/groups/join/:token` - Rejoindre via lien (protégé)
- `DELETE /api/groups/:groupId/members/:userId` - Retirer un membre (protégé)

### Tâches
- `POST /api/tasks` - Créer une tâche (protégé)
- `GET /api/tasks/group/:groupId` - Tâches d'un groupe (protégé)
- `PUT /api/tasks/:id` - Modifier une tâche (protégé)
- `DELETE /api/tasks/:id` - Supprimer une tâche (protégé)

## 🛠️ Corrections effectuées

### Backend
1. ✅ Ajout du modèle `RefreshToken` manquant
2. ✅ Correction validation route `/register` : `fullname` → `name`
3. ✅ Correction fichier `server.Js` → `server.js`
4. ✅ Import du modèle `RefreshToken` dans authController

### Frontend
1. ✅ Configuration proxy Vite pour éliminer CORS
2. ✅ Store auth adapté aux cookies httpOnly (pas de token en localStorage)
3. ✅ RegisterView: envoi de `name` au lieu de `fullname`
4. ✅ LoginView: stylisé + gestion d'erreurs
5. ✅ HomePage: design moderne et responsive
6. ✅ Router guard robuste avec try/catch
7. ✅ Création des stores Pinia manquants (group, task)

## ✅ Tout est prêt !

Votre application est maintenant 100% fonctionnelle :
- ✅ Inscription/Connexion avec cookies sécurisés
- ✅ Gestion de groupes
- ✅ Gestion de tâches
- ✅ Invitations par lien
- ✅ UI moderne et responsive
- ✅ Pas de problème CORS



