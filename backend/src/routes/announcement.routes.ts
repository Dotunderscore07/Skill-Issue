import { Router } from 'express';
import { AnnouncementController } from '../controllers/AnnouncementController';
import { auth, authorizeRole } from '../middlewares/auth';

const router = Router();

router.get('/', auth, AnnouncementController.getAll);
router.post('/', auth, authorizeRole('teacher', 'coordinator', 'admin'), AnnouncementController.create);
router.put('/:id', auth, authorizeRole('teacher', 'coordinator', 'admin'), AnnouncementController.update);
router.delete('/:id', auth, authorizeRole('teacher', 'coordinator', 'admin'), AnnouncementController.delete);

export default router;
