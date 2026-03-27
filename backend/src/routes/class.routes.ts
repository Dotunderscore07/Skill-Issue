import { Router } from 'express';
import { ClassController } from '../controllers/ClassController';
import { auth, authorizeRole } from '../middlewares/auth';

const router = Router();

router.get('/', auth, ClassController.getAll);
router.post('/', auth, authorizeRole('coordinator'), ClassController.create);
router.put('/:id', auth, authorizeRole('coordinator'), ClassController.update);
router.delete('/:id', auth, authorizeRole('coordinator'), ClassController.delete);

export default router;
