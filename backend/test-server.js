// Serveur de test simple pour vérifier que tout fonctionne
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 5002;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: '✅ Serveur fonctionne !' });
});

app.post('/api/auth/register', (req, res) => {
  console.log('📝 Données reçues:', req.body);
  
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Nom, email et mot de passe requis'
    });
  }
  
  console.log('✅ Inscription simulée réussie');
  res.status(201).json({
    success: true,
    data: {
      _id: '123456789',
      name,
      email
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Tentative connexion:', req.body);
  res.json({
    success: true,
    data: {
      _id: '123456789',
      name: 'Test User',
      email: req.body.email
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      _id: '123456789',
      name: 'Test User',
      email: 'test@example.com'
    }
  });
});

app.listen(PORT, () => {
  console.log(` Serveur de TEST démarré sur http://localhost:${PORT}`);
  console.log(' Ce serveur fonctionne SANS MongoDB');
  console.log(' Testez l\'inscription depuis le frontend');
});



