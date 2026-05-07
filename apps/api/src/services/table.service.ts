import { prisma } from '../lib/prisma'

export const TableService = {
  async getTables(merchantId: string) {
    return prisma.table.findMany({
      where: { merchantId },
      orderBy: { tableNumber: 'asc' }
    })
  },

  async createTable(merchantId: string, data: { tableNumber: number; label?: string }) {
    const existing = await prisma.table.findUnique({
      where: { merchantId_tableNumber: { merchantId, tableNumber: data.tableNumber } }
    })
    if (existing) throw new Error('TABLE_EXISTS')

    return prisma.table.create({
      data: { merchantId, tableNumber: data.tableNumber, label: data.label }
    })
  },

  async deleteTable(merchantId: string, tableId: string) {
    const table = await prisma.table.findFirst({ where: { id: tableId, merchantId } })
    if (!table) throw new Error('NOT_FOUND')

    return prisma.table.delete({ where: { id: tableId } })
  }
}
