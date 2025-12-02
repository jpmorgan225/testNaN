import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await RefreshToken.findOneAndUpdate(
    { userId },
    { token: refreshToken, createdAt: new Date() },
    { upsert: true, new: true }
  );
};

const setCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };
  
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, 
  });
  
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
  
  console.log(' Cookies envoyés:', {
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    httpOnly: cookieOptions.httpOnly,
    environment: isProduction ? 'production' : 'development'
  });
};

export const signup = async (req, res) => {
  try {
    console.log(' Tentative inscription:', req.body);
    
    const { email, password, name } = req.body;
    
    if (!name || !email || !password) {
      console.log(' Données manquantes:', { name, email, hasPassword: !!password });
      return res.status(400).json({ 
        success: false, 
        message: 'Nom, email et mot de passe requis' 
      });
    }

    console.log(' Vérification email existant:', email);
    const exists = await User.findOne({ email });
    if (exists) {
      console.log(' Email déjà utilisé');
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }

    console.log(' Création utilisateur...');
    const user = await User.create({ name, email, password });
    console.log(' Utilisateur créé:', user._id);

    console.log(' Génération tokens...');
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    console.log(' Stockage refreshToken...');
    await storeRefreshToken(user._id, refreshToken);
    
    console.log(' Envoi cookies...');
    setCookies(res, accessToken, refreshToken);

    console.log(' Inscription réussie pour:', email);
    res.status(201).json({ 
      success: true, 
      data: { _id: user._id, name: user.name, email: user.email },
      token: accessToken
    });
  } catch (err) {
    console.error(' Erreur inscription complète:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Erreur serveur lors de l\'inscription'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.json({ 
      success: true, 
      data: { _id: user._id, name: user.name, email: user.email },
      token: accessToken
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await RefreshToken.deleteOne({ userId: decoded.userId });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Déconnexion réussie' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Aucun token fourni' });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const stored = await RefreshToken.findOne({ userId: decoded.userId });
    if (!stored || stored.token !== refreshToken) return res.status(401).json({ message: 'Token invalide' });

    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.json({ success: true, message: 'Token renouvelé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};