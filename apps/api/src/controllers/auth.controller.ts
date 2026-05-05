import { Request, Response } from 'express'
import { z } from 'zod'
import { AuthService } from '../services/auth.service'

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export const AuthController = {
  async register(req: Request, res: Response) {
    const parsed = authSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }

    try {
      const result = await AuthService.register(
        parsed.data.email,
        parsed.data.password
      )
      res.status(201).json(result)
    } catch (err: any) {
      if (err.message === 'EMAIL_TAKEN') {
        res.status(409).json({ error: 'Email already registered' })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async login(req: Request, res: Response) {
    const parsed = authSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }

    try {
      const result = await AuthService.login(parsed.data.email, parsed.data.password)
      res.status(200).json(result)
    } catch (err: any) {
      if (err.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ error: 'Invalid email or password' })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
