import { Router } from 'express';
import { RoutineController } from '../controllers/RoutineController';
import { auth, authorizeRole } from '../middlewares/auth';

const router = Router();

router.get('/', auth, authorizeRole('teacher', 'coordinator', 'parent', 'admin'), RoutineController.getAll);
router.post('/', auth, authorizeRole('coordinator'), RoutineController.create);
router.put('/:id', auth, authorizeRole('coordinator'), RoutineController.update);
router.delete('/:id', auth, authorizeRole('coordinator'), RoutineController.delete);

export default router;
