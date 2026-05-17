import { Request, Response, NextFunction } from 'express'
import { verifyToken, type JwtPayload } from './jwt.js'

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' })
    return
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' })
    return
  }

  req.user = payload
  next()
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' })
    return
  }
  next()
}
