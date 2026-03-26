import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { auth, authorizeRole } from '../middlewares/auth';

const router = Router();

router.get('/', auth, UserController.getAll);
router.get('/:id', auth, UserController.getById);
router.put('/:id', auth, UserController.updateProfile);
router.post('/teachers', auth, authorizeRole('coordinator'), UserController.createTeacher);
router.put('/teachers/:id', auth, authorizeRole('coordinator'), UserController.updateTeacher);
router.delete('/teachers/:id', auth, authorizeRole('coordinator'), UserController.deleteTeacher);

export default router;
