import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import groupRoutes from './routes/group.js';
import taskRoutes from './routes/task.js';

import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://testnan-3.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);
console.log('🌐 FRONTEND_URL env:', process.env.FRONTEND_URL);

app.use(cors({
  origin: (origin, callback) => {
    console.log('🔍 CORS check - Request origin:', origin);
    
    if (!origin) {
      console.log('✅ CORS: No origin - allowing');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin allowed');
      callback(null, true);
    } else {
      console.log('❌ CORS: Origin NOT in allowed list:', origin);
      // En production, être plus permissif pour le debug
      if (process.env.NODE_ENV === 'production') {
        // Autoriser toutes les origines *.onrender.com pour le debug
        if (origin.includes('.onrender.com')) {
          console.log('⚠️  CORS: Allowing .onrender.com origin');
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        console.log('⚠️  CORS: Dev mode - allowing');
        callback(null, true); 
      }
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'testNaN MERN API 🚀',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Tentative de connexion MongoDB (${i + 1}/${retries})...`);
      
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI non défini dans les variables d\'environnement');
      }

      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      console.log('✅ MongoDB connecté avec succès');
      return;
    } catch (err) {
      console.error(`❌ Erreur connexion MongoDB (tentative ${i + 1}):`, err.message);
      
      if (i === retries - 1) {
        console.error('💀 Impossible de se connecter à MongoDB après plusieurs tentatives');
        throw err;
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

const startServer = async () => {
  try {
  
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'non défini'}`);
    });
  } catch (err) {
    console.error('💀 Erreur fatale au démarrage:', err);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\n⚠️  Signal SIGINT reçu');
  await mongoose.connection.close();
  console.log('✅ Connexion MongoDB fermée');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Signal SIGTERM reçu');
  await mongoose.connection.close();
  console.log('✅ Connexion MongoDB fermée');
  process.exit(0);
});

startServer();

 