import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ success: false, data: null, error: 'No token, authorization denied' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = (decoded as any).user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, data: null, error: 'Token is not valid' });
  }
};

export const authorizeRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, data: null, error: 'Forbidden: Insufficient role permissions' });
      return;
    }
    next();
  };
};
