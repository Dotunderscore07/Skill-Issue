import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';
import { auth } from '../middlewares/auth';

const router = Router();

router.get('/', auth, MessageController.getThread);
router.post('/', auth, MessageController.send);

export default router;
