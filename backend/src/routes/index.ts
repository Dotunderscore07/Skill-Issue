import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import studentRoutes from './student.routes';
import announcementRoutes from './announcement.routes';
import activityRoutes from './activity.routes';
import attendanceRoutes from './attendance.routes';
import messageRoutes from './message.routes';
import classRoutes from './class.routes';
import routineRoutes from './routine.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/announcements', announcementRoutes);
router.use('/activities', activityRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/messages', messageRoutes);
router.use('/classes', classRoutes);
router.use('/routines', routineRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
