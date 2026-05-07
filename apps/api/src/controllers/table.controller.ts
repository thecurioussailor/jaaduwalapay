import { Request, Response } from 'express'
import { z } from 'zod'
import { TableService } from '../services/table.service'

const createTableSchema = z.object({
  tableNumber: z.number().int().positive(),
  label: z.string().optional()
})

export const TableController = {
  async getTables(req: Request, res: Response) {
    try {
      const tables = await TableService.getTables(req.merchantId)
      res.json({ tables })
    } catch {
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async createTable(req: Request, res: Response) {
    const parsed = createTableSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return }

    try {
      const table = await TableService.createTable(req.merchantId, parsed.data)
      res.status(201).json(table)
    } catch (err: any) {
      if (err.message === 'TABLE_EXISTS') {
        res.status(409).json({ error: `Table ${parsed.data.tableNumber} already exists` })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  async deleteTable(req: Request, res: Response) {
    try {
      await TableService.deleteTable(req.merchantId, req.params.tableId!)
      res.status(204).send()
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') { res.status(404).json({ error: 'Table not found' }); return }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
