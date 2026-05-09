import { prisma } from '../lib/prisma'

export const OrderService = {
  async getOrders(merchantId: string) {
    return prisma.order.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: true,
        table: { select: { tableNumber: true, label: true } }
      }
    })
  },

  async updateStatus(merchantId: string, orderId: string, status: 'CONFIRMED' | 'FAILED') {
    const order = await prisma.order.findFirst({ where: { id: orderId, merchantId } })
    if (!order) throw new Error('NOT_FOUND')

    return prisma.order.update({
      where: { id: orderId },
      data: { status }
    })
  }
}
