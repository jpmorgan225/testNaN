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

router.get('/join/:token', protect, joinGroup);

router.use(protect); 

router.route('/').post(createGroup).get(getGroups);
router.get('/:id', getGroupById);
router.post('/:id/invite', generateInviteLink);
router.delete('/:groupId/members/:userId', removeMember);

export default router;