import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { initDb } from './db';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Use the centralized routes
app.use('/api', routes);

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`KinderConnect API running on http://localhost:${PORT}`);
  });
});

export default app;
