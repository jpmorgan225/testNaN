# 🚀 testNaN - Gestionnaire de Groupes & Tâches

Application web full-stack MERN pour gérer des groupes et des tâches collaboratives.

## ✨ Fonctionnalités

- 👤 **Authentification** : Inscription, connexion avec JWT et cookies httpOnly
- 👥 **Gestion de groupes** : Créer, rejoindre et gérer des groupes
- 🔗 **Invitations** : Liens d'invitation sécurisés avec expiration
- 📋 **Gestion de tâches** : Créer, assigner et suivre des tâches
- 📊 **Suivi en temps réel** : Statuts des tâches (À faire, En cours, Terminée)
- 🎨 **UI moderne** : Interface responsive et intuitive

## 🛠️ Technologies

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (Access & Refresh tokens)
- Cookie-based authentication
- express-validator

### Frontend
- Vue 3 (Composition API)
- Vue Router
- Pinia (state management)
- Vite
- Axios

## 📦 Installation locale

### Prérequis
- Node.js >= 18
- MongoDB (local ou Atlas)

### Backend

```bash
cd backend
npm install
# Créer un fichier .env (voir .env.example)
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Ouvrez http://localhost:5173

## 🚀 Déploiement

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour le guide complet de déploiement sur Render.

### Résumé rapide

1. **MongoDB Atlas** : Configurer IP whitelist (0.0.0.0/0)
2. **Backend Render** : Web Service avec variables d'environnement
3. **Frontend Render** : Static Site avec `VITE_API_URL`

## 📝 Variables d'environnement

### Backend (.env)

```env
MONGO_URI=mongodb+srv://...
PORT=5002
NODE_ENV=development
ACCESS_TOKEN_SECRET=votre_secret_access
REFRESH_TOKEN_SECRET=votre_secret_refresh
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.production)

```env
VITE_API_URL=https://votre-backend.onrender.com
```

## 🎯 Routes API

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil (protégé)

### Groupes
- `GET /api/groups` - Liste des groupes (protégé)
- `POST /api/groups` - Créer un groupe (protégé)
- `GET /api/groups/:id` - Détails (protégé)
- `POST /api/groups/:id/invite` - Générer lien (protégé)
- `GET /api/groups/join/:token` - Rejoindre (protégé)
- `DELETE /api/groups/:groupId/members/:userId` - Retirer membre (protégé)

### Tâches
- `POST /api/tasks` - Créer (protégé)
- `GET /api/tasks/group/:groupId` - Liste par groupe (protégé)
- `PUT /api/tasks/:id` - Modifier (protégé)
- `DELETE /api/tasks/:id` - Supprimer (protégé)

## 📱 Structure du projet

```
testNaN/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── views/
│   │   └── main.js
│   └── vite.config.js
├── DEPLOYMENT.md
├── INSTRUCTIONS.md
└── README.md
```

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- JWT avec access & refresh tokens
- Cookies httpOnly pour les tokens
- CORS configuré
- Validation des entrées
- Routes protégées

## 📄 Licence

MIT

## 👨‍💻 Auteur

Votre nom

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou une PR.

---

**Bon développement ! 🚀**

