import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /public/r/:slug/:tableId — customer ordering page data
router.get('/r/:slug/:tableId', async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        cuisineType: true,
        isActive: true,
        isOnboarded: true,
      }
    })

    if (!merchant || !merchant.isActive || !merchant.isOnboarded) {
      res.status(404).json({ error: 'Restaurant not found' })
      return
    }

    const table = await prisma.table.findFirst({
      where: { id: req.params.tableId, merchantId: merchant.id, isActive: true },
      select: { id: true, tableNumber: true, label: true }
    })

    if (!table) {
      res.status(404).json({ error: 'Table not found' })
      return
    }

    const categories = await prisma.menuCategory.findMany({
      where: { merchantId: merchant.id, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    const uncategorized = await prisma.menuItem.findMany({
      where: { merchantId: merchant.id, categoryId: null, isAvailable: true },
      orderBy: { sortOrder: 'asc' }
    })

    res.json({ merchant, table, categories, uncategorized })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
