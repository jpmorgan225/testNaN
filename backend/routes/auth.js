import express from 'express';
import {
  signup,
  login,
  logout,
  refreshToken,
  getProfile,
} from '../controllers/authController.js';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(' Erreurs de validation:', errors.array());
    return res.status(400).json({ 
      success: false, 
      message: 'Erreur de validation',
      errors: errors.array() 
    });
  }
  if (next) next();
};

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
  ],
  handleValidationErrors,
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password').exists().withMessage('Le mot de passe est requis'),
  ],
  handleValidationErrors,
  login
);

router.post('/logout', logout);
router.post('/refresh', refreshToken);

router.get('/me', protect, getProfile);

export default router;