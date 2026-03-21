import express, { Router, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { UserController, StudentController, AnnouncementController, ActivityController, AttendanceController, MessageController, ClassController, DashboardController } from './controllers';
import { AuthController } from './controllers/AuthController';
import { auth, authorizeRole } from './middlewares/auth';
import { initDb } from './db';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const router = Router();

// Auth
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', auth, AuthController.me);
router.post('/auth/logout', AuthController.logout);

// Users
router.get('/users', auth, UserController.getAll);
router.get('/users/:id', auth, UserController.getById);
router.post('/users/teachers', auth, authorizeRole('coordinator'), UserController.createTeacher);
router.put('/users/teachers/:id', auth, authorizeRole('coordinator'), UserController.updateTeacher);

// Classes
router.get('/classes', auth, ClassController.getAll);
router.post('/classes', auth, authorizeRole('coordinator'), ClassController.create);
router.put('/classes/:id', auth, authorizeRole('coordinator'), ClassController.update);

// Students
router.get('/students', auth, StudentController.getAll);
router.post('/students', auth, authorizeRole('coordinator'), StudentController.create);
router.put('/students/:studentId', auth, authorizeRole('coordinator'), StudentController.update);
router.put('/students/:studentId/link', auth, authorizeRole('teacher', 'coordinator', 'admin'), StudentController.linkParent);

// Announcements
router.get('/announcements', auth, AnnouncementController.getAll);
router.post('/announcements', auth, authorizeRole('teacher', 'coordinator', 'admin'), AnnouncementController.create);

// Activities
router.get('/activities', auth, ActivityController.getAll);
router.post('/activities', auth, authorizeRole('teacher', 'coordinator', 'admin'), ActivityController.create);
router.put('/activities/:id', auth, authorizeRole('teacher', 'coordinator', 'admin'), ActivityController.update);
router.delete('/activities/:id', auth, authorizeRole('teacher', 'coordinator', 'admin'), ActivityController.delete);

// Attendance
router.get('/attendance', auth, AttendanceController.getAll);
router.put('/attendance', auth, authorizeRole('teacher', 'coordinator', 'admin'), AttendanceController.update);

// Messages
router.get('/messages', auth, MessageController.getThread);
router.post('/messages', auth, MessageController.send);

// Coordinator dashboard
router.get('/dashboard/coordinator', auth, authorizeRole('coordinator'), DashboardController.getCoordinatorSummary);

app.use('/api', router);

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`KinderConnect API running on http://localhost:${PORT}`);
  });
});

export default app;
