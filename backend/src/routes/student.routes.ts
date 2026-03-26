import { Router } from 'express';
import { StudentController } from '../controllers/StudentController';
import { auth, authorizeRole } from '../middlewares/auth';

const router = Router();

router.get('/', auth, StudentController.getAll);
router.post('/', auth, authorizeRole('coordinator'), StudentController.create);
router.put('/:studentId', auth, authorizeRole('coordinator', 'parent'), StudentController.update);
router.put('/:studentId/link', auth, authorizeRole('teacher', 'coordinator', 'admin'), StudentController.linkParent);
router.delete('/:studentId', auth, authorizeRole('coordinator'), StudentController.delete);

export default router;
