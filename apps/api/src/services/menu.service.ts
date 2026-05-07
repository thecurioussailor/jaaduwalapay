import { prisma } from '../lib/prisma'

export const MenuService = {
  async getMenu(merchantId: string) {
    const categories = await prisma.menuCategory.findMany({
      where: { merchantId },
      orderBy: { sortOrder: 'asc' },
      include: {
        menuItems: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    const uncategorized = await prisma.menuItem.findMany({
      where: { merchantId, categoryId: null },
      orderBy: { sortOrder: 'asc' }
    })

    return { categories, uncategorized }
  },

  async createCategory(merchantId: string, data: { name: string; emoji?: string }) {
    const last = await prisma.menuCategory.findFirst({
      where: { merchantId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true }
    })

    return prisma.menuCategory.create({
      data: { merchantId, name: data.name, emoji: data.emoji, sortOrder: (last?.sortOrder ?? 0) + 1 }
    })
  },

  async createItem(merchantId: string, data: {
    name: string
    description?: string
    priceUsdc: number
    categoryId?: string
    imageUrl?: string
  }) {
    const last = await prisma.menuItem.findFirst({
      where: { merchantId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true }
    })

    return prisma.menuItem.create({
      data: { merchantId, ...data, sortOrder: (last?.sortOrder ?? 0) + 1 }
    })
  },

  async updateItem(merchantId: string, itemId: string, data: {
    name?: string
    description?: string
    priceUsdc?: number
    isAvailable?: boolean
    imageUrl?: string
    categoryId?: string
  }) {
    const item = await prisma.menuItem.findFirst({ where: { id: itemId, merchantId } })
    if (!item) throw new Error('NOT_FOUND')

    return prisma.menuItem.update({ where: { id: itemId }, data })
  },

  async deleteItem(merchantId: string, itemId: string) {
    const item = await prisma.menuItem.findFirst({ where: { id: itemId, merchantId } })
    if (!item) throw new Error('NOT_FOUND')

    return prisma.menuItem.delete({ where: { id: itemId } })
  },

  async deleteCategory(merchantId: string, categoryId: string) {
    const category = await prisma.menuCategory.findFirst({ where: { id: categoryId, merchantId } })
    if (!category) throw new Error('NOT_FOUND')

    // uncategorize items instead of deleting them
    await prisma.menuItem.updateMany({
      where: { categoryId },
      data: { categoryId: null }
    })

    return prisma.menuCategory.delete({ where: { id: categoryId } })
  }
}
