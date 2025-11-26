import express from 'express';
import {
  createTask,
  getTasksByGroup,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); 

router.route('/').post(createTask);
router.get('/group/:groupId', getTasksByGroup);
router.route('/:id').put(updateTask).delete(deleteTask);

export default router;