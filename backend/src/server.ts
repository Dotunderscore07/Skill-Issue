import express, { Router, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { UserController, StudentController, AnnouncementController, ActivityController, AttendanceController, MessageController } from './controllers';
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

// Students
router.get('/students', auth, StudentController.getAll);
router.put('/students/:studentId/link', auth, authorizeRole('teacher', 'admin'), StudentController.linkParent);

// Announcements
router.get('/announcements', auth, AnnouncementController.getAll);
router.post('/announcements', auth, authorizeRole('teacher', 'admin'), AnnouncementController.create);

// Activities
router.get('/activities', auth, ActivityController.getAll);
router.post('/activities', auth, authorizeRole('teacher', 'admin'), ActivityController.create);
router.put('/activities/:id', auth, authorizeRole('teacher', 'admin'), ActivityController.update);
router.delete('/activities/:id', auth, authorizeRole('teacher', 'admin'), ActivityController.delete);

// Attendance
router.get('/attendance', auth, AttendanceController.getAll);
router.put('/attendance', auth, authorizeRole('teacher', 'admin'), AttendanceController.update);

// Messages
router.get('/messages', auth, MessageController.getThread);
router.post('/messages', auth, MessageController.send);

app.use('/api', router);

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`KinderConnect API running on http://localhost:${PORT}`);
  });
});

export default app;
