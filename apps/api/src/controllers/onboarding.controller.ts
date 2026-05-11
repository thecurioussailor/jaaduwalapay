import { Request, Response } from 'express'
import { z } from 'zod'
import { OnboardingService } from '../services/onboarding.service'

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  city: z.string().optional(),
  cuisineType: z.string().optional(),
})

const walletSchema = z.object({
  walletAddress: z.string().min(32),
  signature: z.string().min(1),
})

export const OnboardingController = {
  async saveProfile(req: Request, res: Response) {
    const parsed = profileSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }

    try {
      const result = await OnboardingService.saveProfile(req.merchantId, parsed.data)
      res.json(result)
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async getWalletChallenge(req: Request, res: Response) {
    try {
      const result = await OnboardingService.getWalletChallenge(req.merchantId)
      res.json(result)
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async verifyWallet(req: Request, res: Response) {
    const parsed = walletSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }

    try {
      const result = await OnboardingService.verifyWallet(
        req.merchantId,
        parsed.data.walletAddress,
        parsed.data.signature
      )
      res.json(result)
    } catch (err: any) {
      if (err.message === 'NO_CHALLENGE') {
        res.status(400).json({ error: 'Request a challenge first' })
        return
      }
      if (err.message === 'CHALLENGE_EXPIRED') {
        res.status(400).json({ error: 'Challenge expired, request a new one' })
        return
      }
      if (err.message === 'INVALID_SIGNATURE') {
        res.status(400).json({ error: 'Signature verification failed' })
        return
      }
      console.error('verifyWallet error:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async completeOnboarding(req: Request, res: Response) {
    try {
      const result = await OnboardingService.completeOnboarding(req.merchantId)
      res.json(result)
    } catch (err: any) {
      if (err.message === 'WALLET_NOT_VERIFIED') {
        res.status(400).json({ error: 'Verify your wallet before completing onboarding' })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
