import { prisma } from '../lib/prisma'

export const MerchantService = {
  async getMe(merchantId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
        phone: true,
        city: true,
        cuisineType: true,
        walletAddress: true,
        walletVerified: true,
        isOnboarded: true,
        isActive: true,
        onboardingStep: true,
        logoUrl: true,
        createdAt: true,
      }
    })

    if (!merchant) throw new Error('NOT_FOUND')
    return merchant
  }
}
