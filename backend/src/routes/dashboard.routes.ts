import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { auth, authorizeRole } from '../middlewares/auth';

const router = Router();

router.get('/coordinator', auth, authorizeRole('coordinator'), DashboardController.getCoordinatorSummary);

export default router;
