import express, { Router, Request, Response } from 'express';
import cors from 'cors';
import { UserController, AnnouncementController, ActivityController, AttendanceController, MessageController } from './controllers';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

const router = Router();

// Users
router.get('/users', (req: Request, res: Response) => UserController.getAll(req as never, res as never));
router.get('/users/:id', (req: Request, res: Response) => UserController.getById(req as never, res as never));

// Announcements
router.get('/announcements', (req: Request, res: Response) => AnnouncementController.getAll(req as never, res as never));
router.post('/announcements', (req: Request, res: Response) => AnnouncementController.create(req as never, res as never));

// Activities
router.get('/activities', (req: Request, res: Response) => ActivityController.getAll(req as never, res as never));
router.post('/activities', (req: Request, res: Response) => ActivityController.create(req as never, res as never));

// Attendance
router.get('/attendance', (req: Request, res: Response) => AttendanceController.getAll(req as never, res as never));
router.put('/attendance', (req: Request, res: Response) => AttendanceController.update(req as never, res as never));

// Messages
router.get('/messages', (req: Request, res: Response) => MessageController.getThread(req as never, res as never));
router.post('/messages', (req: Request, res: Response) => MessageController.send(req as never, res as never));

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`KinderConnect API running on http://localhost:${PORT}`);
});

export default app;
