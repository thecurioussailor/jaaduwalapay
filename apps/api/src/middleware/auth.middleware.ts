import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      merchantId: string
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' })
    return
  }

  try {
    const token = header.split(' ')[1]!
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { merchantId: string }
    req.merchantId = payload.merchantId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
