import { NextApiRequest, NextApiResponse } from 'next';
import { UserController } from '../../../backend/src/controllers';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return UserController.getAll(req, res);
  res.status(405).json({ success: false, data: null, error: 'Method not allowed' });
}
