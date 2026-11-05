import { Request, Response, NextFunction } from 'express';
import * as core from 'express-serve-static-core';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  userId?: string;
  userEmail?: string;
}

export interface AuthTokenPayload extends JwtPayload {
  id: string;
  email?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(503).json({ error: 'Authentication is not configured on the server.' });

  jwt.verify(token, secret, (err, decoded) => {
    if (err || !decoded || typeof decoded === 'string') {
      return res.status(403).json({ error: 'Token invalid or expired' });
    }
    const payload = decoded as AuthTokenPayload;
    req.userId = payload.id;
    req.userEmail = payload.email;
    next();
  });
};
