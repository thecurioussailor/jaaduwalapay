import { Request, Response } from 'express'
import { OrderService } from '../services/order.service'

export const OrderController = {
  async getOrders(req: Request, res: Response) {
    try {
      const orders = await OrderService.getOrders(req.merchantId)
      res.json({ orders })
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
