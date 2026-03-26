import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';
import { auth, authorizeRole } from '../middlewares/auth';

const router = Router();

router.get('/', auth, AttendanceController.getAll);
router.put('/', auth, authorizeRole('teacher', 'coordinator', 'admin'), AttendanceController.update);

export default router;
