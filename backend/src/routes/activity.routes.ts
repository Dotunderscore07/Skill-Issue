import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController';
import { auth, authorizeRole } from '../middlewares/auth';

const router = Router();

router.get('/', auth, ActivityController.getAll);
router.post('/', auth, authorizeRole('teacher', 'coordinator', 'admin'), ActivityController.create);
router.put('/:id', auth, authorizeRole('teacher', 'coordinator', 'admin'), ActivityController.update);
router.delete('/:id', auth, authorizeRole('teacher', 'coordinator', 'admin'), ActivityController.delete);

export default router;
