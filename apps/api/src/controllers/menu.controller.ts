import { Request, Response } from 'express'
import { z } from 'zod'
import { MenuService } from '../services/menu.service'

const categorySchema = z.object({
  name: z.string().min(1),
  emoji: z.string().optional()
})

const createItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceUsdc: z.number().positive(),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional()
})

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceUsdc: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
  categoryId: z.string().optional()
})

export const MenuController = {
  async getMenu(req: Request, res: Response) {
    try {
      const result = await MenuService.getMenu(req.merchantId)
      res.json(result)
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async createCategory(req: Request, res: Response) {
    const parsed = categorySchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return }

    try {
      const result = await MenuService.createCategory(req.merchantId, parsed.data)
      res.status(201).json(result)
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async createItem(req: Request, res: Response) {
    const parsed = createItemSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return }

    try {
      const result = await MenuService.createItem(req.merchantId, parsed.data)
      res.status(201).json(result)
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async updateItem(req: Request, res: Response) {
    const parsed = updateItemSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return }

    try {
      const result = await MenuService.updateItem(req.merchantId, req.params.itemId as string, parsed.data)
      res.json(result)
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') { res.status(404).json({ error: 'Item not found' }); return }
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async deleteItem(req: Request, res: Response) {
    try {
      await MenuService.deleteItem(req.merchantId, req.params.itemId as string)
      res.status(204).send()
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') { res.status(404).json({ error: 'Item not found' }); return }
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      await MenuService.deleteCategory(req.merchantId, req.params.categoryId as string)
      res.status(204).send()
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') { res.status(404).json({ error: 'Category not found' }); return }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
