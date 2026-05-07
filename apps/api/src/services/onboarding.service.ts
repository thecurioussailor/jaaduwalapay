import { prisma } from '../lib/prisma';
import { verifySignature } from '@solana/kit';
import bs58 from 'bs58';
import crypto from 'crypto';

export const OnboardingService = {
    async saveProfile(merchantId: string, data: {
        name: string,
        phone?: string,
        city?: string,
        cuisineType?: string
    }) {
        const slug = data.name  
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
        
         // handle slug collision by appending random suffix
        const existing = await prisma.merchant.findFirst({
            where: { slug, NOT: { id: merchantId } }
        });

        const finalSlug = existing ? `${slug}-${crypto.randomBytes(3).toString('hex')}` : slug;

        return prisma.merchant.update({
            where: { id: merchantId },
            data: { ...data, slug: finalSlug, onboardingStep: 1 },
            select: { id: true, name: true, slug: true, onboardingStep: true }
        })
    },

    async getWalletChallenge(merchantId: string) {
        const nonce = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    
        await prisma.walletChallenge.upsert({
          where: { merchantId },
          update: { nonce, expiresAt },
          create: { merchantId, nonce, expiresAt }
        })
    
        return {
          message: `Sign this message to verify wallet ownership for Jaaduwalapay.\n\nNonce: ${nonce}`,
          nonce
        }
      },
    
      async verifyWallet(merchantId: string, walletAddress: string, signature: string) {
        const challenge = await prisma.walletChallenge.findUnique({ where: { merchantId } })
    
        if (!challenge) throw new Error('NO_CHALLENGE')
        if (challenge.expiresAt < new Date()) throw new Error('CHALLENGE_EXPIRED')
    
        const message = `Sign this message to verify wallet ownership for Jaaduwalapay.\n\nNonce: ${challenge.nonce}`
    
        try {
          // decode base58 wallet address to raw 32 bytes
          const pubkeyBytes = bs58.decode(walletAddress)
    
          // import as Web Crypto CryptoKey for verification
          const publicKey = await crypto.subtle.importKey(
            'raw',
            pubkeyBytes,
            { name: 'Ed25519' },
            false,
            ['verify']
          )
    
          // decode base58 signature to bytes
          const signatureBytes = bs58.decode(signature)
    
          // encode message to bytes
          const messageBytes = new TextEncoder().encode(message)
    
          // verify using @solana/kit
          const valid = await verifySignature(
            publicKey,
            signatureBytes as unknown as Parameters<typeof verifySignature>[1],
            messageBytes
          )
    
          if (!valid) throw new Error('INVALID_SIGNATURE')
        } catch (e: any) {
          if (e.message === 'INVALID_SIGNATURE') throw e
          throw new Error('INVALID_SIGNATURE')
        }
    
        await prisma.walletChallenge.delete({ where: { merchantId } })
    
        return prisma.merchant.update({
          where: { id: merchantId },
          data: {
            walletAddress,
            walletVerified: true,
            walletLinkedAt: new Date(),
            onboardingStep: 2
          },
          select: { id: true, walletAddress: true, walletVerified: true, onboardingStep: true }
        })
      },
    
      async completeOnboarding(merchantId: string) {
        const merchant = await prisma.merchant.findUnique({
          where: { id: merchantId },
          select: { onboardingStep: true, walletVerified: true }
        })
    
        if (!merchant) throw new Error('NOT_FOUND')
        if (!merchant.walletVerified) throw new Error('WALLET_NOT_VERIFIED')
    
        return prisma.merchant.update({
          where: { id: merchantId },
          data: { isOnboarded: true, onboardingStep: 3 },
          select: { id: true, isOnboarded: true }
        })
      }
}