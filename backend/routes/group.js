import express from 'express';
import {
  createGroup,
  getGroups,
  getGroupById,
  generateInviteLink,
  joinGroup,
  removeMember,
} from '../controllers/groupeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Route publique pour rejoindre un groupe (nécessite quand même une authentification)
// Mais on la met avant router.use(protect) pour gérer l'authentification dans le contrôleur
router.get('/join/:token', protect, joinGroup);

// Toutes les autres routes nécessitent une authentification
router.use(protect); 

router.route('/').post(createGroup).get(getGroups);
router.get('/:id', getGroupById);
router.post('/:id/invite', generateInviteLink);
router.delete('/:groupId/members/:userId', removeMember);

export default router;