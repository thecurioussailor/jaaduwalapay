import { Request, Response } from 'express'
import { MerchantService } from '../services/merchant.service'

export const MerchantController = {
  async getMe(req: Request, res: Response) {
    try {
      const merchant = await MerchantService.getMe(req.merchantId)
      res.json({ merchant })
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        res.status(404).json({ error: 'Merchant not found' })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
