import { Request, Response } from 'express'
import { z } from 'zod'
import { PayService } from '../services/pay.service'

const buildSchema = z.object({
  customerWallet: z.string().min(32),
  merchantId: z.string(),
  tableId: z.string(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().positive()
  })).min(1)
})

const confirmSchema = z.object({
  signedTx: z.string(),
  merchantId: z.string(),
  tableId: z.string(),
  customerWallet: z.string(),
  totalUsdc: z.number(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number(),
    name: z.string(),
    priceUsdc: z.number()
  }))
})

export const PayController = {
  async buildTransaction(req: Request, res: Response) {
    const parsed = buildSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return }

    try {
      const result = await PayService.buildTransaction(parsed.data)
      res.json(result)
    } catch (err: any) {
      if (err.message === 'MERCHANT_NO_WALLET') {
        res.status(400).json({ error: 'Merchant has no wallet configured' }); return
      }
      if (err.message === 'MERCHANT_INACTIVE') {
        res.status(400).json({ error: 'Merchant is not accepting payments' }); return
      }
      if (err.message === 'INVALID_ITEMS') {
        res.status(400).json({ error: 'One or more items are unavailable' }); return
      }
      console.error('buildTransaction error:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async confirmPayment(req: Request, res: Response) {
    const parsed = confirmSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return }

    try {
      const { signature } = await PayService.submitToKora(parsed.data.signedTx)

      const order = await PayService.saveOrder({
        merchantId: parsed.data.merchantId,
        tableId: parsed.data.tableId,
        customerWallet: parsed.data.customerWallet,
        totalUsdc: parsed.data.totalUsdc,
        txSignature: signature,
        items: parsed.data.items
      })

      res.json({ success: true, txSignature: signature, orderId: order.id })
    } catch (err: any) {
      console.error('confirmPayment error:', err)
      if (err.message?.includes('KORA')) {
        res.status(502).json({ error: 'Payment relay error. Try again.' }); return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
