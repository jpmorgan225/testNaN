# 🚀 Guide de déploiement sur Render

## 📋 Prérequis

- Compte GitHub
- Compte Render (gratuit)
- Compte MongoDB Atlas (gratuit)

---

## 1️⃣ Préparer MongoDB Atlas pour la production

### Étape 1 : Configurer MongoDB Atlas

1. Allez sur https://cloud.mongodb.com/
2. Connectez-vous
3. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
4. **Database Access** → Vérifiez que votre utilisateur existe
5. **Database** → **Connect** → **Connect your application**
6. Copiez la connection string :
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/testNaN?retryWrites=true&w=majority
   ```

---

## 2️⃣ Préparer le Backend pour Render

### Fichier `backend/package.json` - Vérifier les scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Variables d'environnement nécessaires

Le backend a besoin de ces variables :
- `MONGO_URI` : Connection string MongoDB Atlas
- `PORT` : 5002 (ou laissez Render le définir)
- `ACCESS_TOKEN_SECRET` : Secret pour JWT access tokens
- `REFRESH_TOKEN_SECRET` : Secret pour JWT refresh tokens
- `FRONTEND_URL` : URL du frontend déployé
- `NODE_ENV` : production

---

## 3️⃣ Déployer le Backend sur Render

### Étape 1 : Pusher sur GitHub

```bash
# Dans le dossier racine du projet
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/testNaN.git
git push -u origin main
```

### Étape 2 : Créer le Web Service Backend

1. Allez sur https://render.com/
2. Cliquez **New +** → **Web Service**
3. Connectez votre repo GitHub
4. Configurez :
   - **Name** : `testnan-backend`
   - **Root Directory** : `backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : `Free`

### Étape 3 : Ajouter les variables d'environnement

Dans **Environment** → **Add Environment Variable** :

```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/testNaN?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=votre_secret_super_long_et_aleatoire_123456789
REFRESH_TOKEN_SECRET=votre_autre_secret_super_long_et_aleatoire_987654321
NODE_ENV=production
FRONTEND_URL=https://testnan-frontend.onrender.com
```

**⚠️ Générez des secrets forts :**
```bash
# Dans un terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Étape 4 : Déployer

Cliquez **Create Web Service** → Render va build et déployer automatiquement

**Notez l'URL du backend** : `https://testnan-backend.onrender.com`

---

## 4️⃣ Préparer le Frontend pour Render

### Fichier `frontend/.env.production`

Créez ce fichier :

```env
VITE_API_URL=https://testnan-backend.onrender.com
```

### Fichier `frontend/package.json` - Vérifier les scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Créer `frontend/render.yaml` (optionnel)

```yaml
services:
  - type: web
    name: testnan-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## 5️⃣ Déployer le Frontend sur Render

### Option A : Static Site (Recommandé)

1. **New +** → **Static Site**
2. Connectez votre repo GitHub
3. Configurez :
   - **Name** : `testnan-frontend`
   - **Root Directory** : `frontend`
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`

4. **Environment Variables** :
   ```
   VITE_API_URL=https://testnan-backend.onrender.com
   ```

5. **Rewrite Rules** (important pour Vue Router) :
   - Source : `/*`
   - Destination : `/index.html`
   - Action : `Rewrite`

### Option B : Web Service avec serveur Node

Si vous préférez un serveur Node pour servir le frontend :

**Créer `frontend/server.js` :**

```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques
app.use(express.static(join(__dirname, 'dist')));

// Toutes les routes renvoient index.html (pour Vue Router)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend servi sur le port ${PORT}`);
});
```

**Modifier `frontend/package.json` :**

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

**Sur Render :**
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm start`

---

## 6️⃣ Mettre à jour les URLs

### Backend `server.js`

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Frontend `vite.config.js`

En production, le proxy n'est pas utilisé. Le frontend appelle directement l'API via `VITE_API_URL`.

---

## 7️⃣ Gestion des liens d'invitation en production

### Backend `controllers/groupeController.js`

```javascript
export const generateInviteLink = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Groupe non trouvé' });
    
    const token = crypto.randomBytes(32).toString('hex');
    group.inviteToken = token;
    group.inviteExpires = Date.now() + 24 * 60 * 60 * 1000;
    await group.save();

    // Utilise FRONTEND_URL depuis les variables d'environnement
    const link = `${process.env.FRONTEND_URL}/join/${token}`;
    res.status(200).json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
```

**Le lien généré sera automatiquement :**
- Local : `http://localhost:5173/join/abc123...`
- Production : `https://testnan-frontend.onrender.com/join/abc123...`

---

## 8️⃣ Déploiement automatique (CI/CD)

Render redéploie automatiquement quand vous poussez sur GitHub :

```bash
# Faire des modifications
git add .
git commit -m "Update feature"
git push origin main

# Render détecte le push et redéploie automatiquement
```

---

## 9️⃣ Vérifications post-déploiement

### ✅ Checklist

- [ ] Backend accessible : `https://testnan-backend.onrender.com/`
- [ ] Frontend accessible : `https://testnan-frontend.onrender.com/`
- [ ] MongoDB connecté (vérifier les logs Render)
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Création de groupes fonctionne
- [ ] Liens d'invitation fonctionnent
- [ ] Création de tâches fonctionne

### Tester les liens d'invitation

1. Créez un groupe en production
2. Générez un lien d'invitation
3. Le lien doit être : `https://testnan-frontend.onrender.com/join/TOKEN`
4. Ouvrez le lien dans un onglet privé
5. Inscrivez-vous avec un nouveau compte
6. Rejoignez le groupe

---

## 🔧 Dépannage

### Backend ne démarre pas

**Vérifier les logs Render :**
- Allez dans le dashboard Render
- Cliquez sur votre service backend
- Onglet **Logs**

**Erreurs courantes :**
- MongoDB : Vérifiez `MONGO_URI` et IP whitelist
- Secrets JWT : Vérifiez `ACCESS_TOKEN_SECRET` et `REFRESH_TOKEN_SECRET`

### Frontend ne charge pas

**Vérifier :**
- Build réussi dans les logs
- `VITE_API_URL` correctement défini
- Rewrite rules configurées (pour Vue Router)

### CORS errors

**Vérifier :**
- `FRONTEND_URL` dans les variables backend
- CORS configuré dans `server.js`

### Liens d'invitation ne marchent pas

**Vérifier :**
- `FRONTEND_URL` dans les variables backend
- Route `/join/:token` existe dans le router frontend

---

## 💰 Coûts

### Plan Free Render

**Backend :**
- ✅ Gratuit
- ⚠️ Se met en veille après 15 min d'inactivité
- ⚠️ Premier démarrage peut prendre 30-60 secondes

**Frontend (Static Site) :**
- ✅ Gratuit
- ✅ Pas de mise en veille
- ✅ CDN global

**MongoDB Atlas :**
- ✅ Gratuit (512 MB)

**Total : 0€ / mois** 🎉

### Éviter la mise en veille du backend

**Option 1 - Ping service (gratuit) :**
Utilisez https://uptimerobot.com/ pour pinger votre backend toutes les 5 minutes

**Option 2 - Plan payant Render :**
7$/mois pour éviter la mise en veille

---

## 📝 Résumé des URLs

```
Backend API : https://testnan-backend.onrender.com
Frontend    : https://testnan-frontend.onrender.com
MongoDB     : mongodb+srv://...@cluster0.mongodb.net/testNaN

Liens d'invitation : https://testnan-frontend.onrender.com/join/TOKEN
```

---

## 🎯 Commandes utiles

```bash
# Générer un secret JWT
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Tester l'API backend
curl https://testnan-backend.onrender.com/

# Voir les logs en temps réel
# → Dashboard Render → Service → Logs
```

---

## ✅ C'est prêt !

Votre application est maintenant en production avec :
- ✅ Backend Node.js + Express
- ✅ Frontend Vue.js
- ✅ Base de données MongoDB Atlas
- ✅ Déploiement automatique
- ✅ HTTPS gratuit
- ✅ Liens d'invitation fonctionnels

**Partagez votre app : `https://testnan-frontend.onrender.com`** 🚀

