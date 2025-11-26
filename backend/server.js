import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes   from './routes/auth.js';
import groupRoutes  from './routes/group.js';
import taskRoutes   from './routes/task.js';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',   authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tasks',  taskRoutes);

app.get('/', (_req, res) => res.send('testNaN MERN API 🚀'));

console.log('>>> MONGO_URI lue :', process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');
    app.listen(PORT, () =>
      console.log(`🚀 Serveur démarré sur le port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB erreur :', err.message);
    process.exit(1);
  });

 