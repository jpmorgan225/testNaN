# 🚀 DÉMARRAGE DE L'APPLICATION - testNaN

## ⚠️ IMPORTANT : Démarrer dans cet ordre !

### Étape 1️⃣ : Démarrer le BACKEND d'abord

Ouvrez un **nouveau terminal** (Terminal 1) :

```bash
cd C:\Users\DELL\Desktop\testNaN\backend
npm start
```

**Attendez de voir :**
```
✅ MongoDB connecté
🚀 Serveur démarré sur le port 5002
```

⚠️ **Si vous voyez une erreur MongoDB :**
- Option A : Configurez MongoDB Atlas (voir ci-dessous)
- Option B : Installez MongoDB localement

---

### Étape 2️⃣ : Démarrer le FRONTEND ensuite

Ouvrez un **autre terminal** (Terminal 2) :

```bash
cd C:\Users\DELL\Desktop\testNaN\frontend
npm run dev
```

**Attendez de voir :**
```
➜ Local: http://localhost:5173/
```

Puis ouvrez **http://localhost:5173** dans votre navigateur

---

## 🔧 Résoudre l'erreur MongoDB

### Option A : MongoDB Atlas (Cloud)

1. Allez sur https://cloud.mongodb.com/
2. Connectez-vous
3. Cliquez sur **Network Access** (menu gauche)
4. Cliquez sur **Add IP Address**
5. Choisissez **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Cliquez **Confirm**
7. **Attendez 2 minutes** que ça se propage
8. Redémarrez le backend (Ctrl+C puis `npm start`)

### Option B : MongoDB Local (Plus simple)

1. **Téléchargez MongoDB Community Server :**
   https://www.mongodb.com/try/download/community

2. **Installez-le** (installation par défaut)

3. **Ouvrez un nouveau terminal (Terminal 3) et démarrez MongoDB :**
   ```bash
   mongod
   ```

4. **Modifiez le fichier `.env` du backend :**
   ```
   MONGO_URI=mongodb://localhost:27017/testNaN
   ```

5. **Redémarrez le backend** (Terminal 1) :
   ```bash
   Ctrl+C
   npm start
   ```

---

## ✅ Vérifier que tout fonctionne

### Terminal 1 (Backend) doit afficher :
```
✅ MongoDB connecté
🚀 Serveur démarré sur le port 5002
```

### Terminal 2 (Frontend) doit afficher :
```
➜ Local: http://localhost:5173/
```

### Dans le navigateur :
- Ouvrez http://localhost:5173
- Cliquez sur "Inscription"
- Créez un compte

---

## 🐛 Problèmes courants

### "ECONNREFUSED" dans le frontend
➡️ Le backend n'est pas démarré. Retournez à l'Étape 1.

### "ETIMEDOUT" MongoDB
➡️ MongoDB Atlas bloque votre IP. Suivez "Option A" ou "Option B" ci-dessus.

### "Port 5002 already in use"
```bash
# Windows
netstat -ano | findstr :5002
taskkill /PID <PID> /F

# Puis redémarrez
npm start
```

---

## 📱 Ordre de démarrage (RÉSUMÉ)

1. ✅ Backend d'abord : `cd backend && npm start`
2. ✅ Frontend ensuite : `cd frontend && npm run dev`
3. ✅ Ouvrir navigateur : http://localhost:5173

**Ne démarrez JAMAIS le frontend avant le backend !**



