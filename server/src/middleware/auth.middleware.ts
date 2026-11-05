import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(503).json({ error: 'Authentication is not configured on the server.' });

  jwt.verify(token, secret, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalid or expired' });
    }
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  });
};
