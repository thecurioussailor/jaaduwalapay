import { prisma } from '../lib/prisma'
import {
  address,
  createSolanaRpc,
  type Address,
} from '@solana/kit'
import {
  getAssociatedTokenAddressSync,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

const USDC_MINT = process.env.USDC_MINT!
const KORA_URL = process.env.KORA_URL!
const FEE_PAYER_PUBKEY = process.env.KORA_FEE_PAYER_PUBKEY!
const RPC_URL = process.env.SOLANA_RPC!
const USDC_DECIMALS = 6

// convert spl-token PublicKey to @solana/kit Address
function toAddress(pubkey: PublicKey): Address {
  return address(pubkey.toBase58())
}

export const PayService = {
  async buildTransaction(data: {
    customerWallet: string
    merchantId: string
    tableId: string
    items: { menuItemId: string; quantity: number }[]
  }) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: data.merchantId },
      select: { walletAddress: true, isActive: true, isOnboarded: true }
    })

    if (!merchant?.walletAddress) throw new Error('MERCHANT_NO_WALLET')
    if (!merchant.isActive || !merchant.isOnboarded) throw new Error('MERCHANT_INACTIVE')

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: data.items.map(i => i.menuItemId) },
        merchantId: data.merchantId,
        isAvailable: true
      }
    })

    if (menuItems.length !== data.items.length) throw new Error('INVALID_ITEMS')

    const totalUsdc = data.items.reduce((sum, orderItem) => {
      const menuItem = menuItems.find((m: { id: string; priceUsdc: number }) => m.id === orderItem.menuItemId)!
      return sum + menuItem.priceUsdc * orderItem.quantity
    }, 0)

    const amountLamports = BigInt(Math.round(totalUsdc * 10 ** USDC_DECIMALS))

    // use PublicKey from spl-token for ATA derivation
    const customerPubkey = new PublicKey(data.customerWallet)
    const merchantPubkey = new PublicKey(merchant.walletAddress)
    const feePayerPubkey = new PublicKey(FEE_PAYER_PUBKEY)
    const usdcMintPubkey = new PublicKey(USDC_MINT)

    const customerAta = getAssociatedTokenAddressSync(usdcMintPubkey, customerPubkey)
    const merchantAta = getAssociatedTokenAddressSync(usdcMintPubkey, merchantPubkey)

    // use @solana/kit for RPC
    const rpc = createSolanaRpc(RPC_URL)
    const { value: { blockhash, lastValidBlockHeight } } = await rpc.getLatestBlockhash().send()

    const splInstructions = []

    // create merchant ATA if it doesn't exist
    const merchantAtaInfo = await rpc.getAccountInfo(
      toAddress(merchantAta),
      { encoding: 'base64' }
    ).send()
    if (!merchantAtaInfo.value) {
      splInstructions.push(
        createAssociatedTokenAccountInstruction(
          feePayerPubkey,
          merchantAta,
          merchantPubkey,
          usdcMintPubkey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      )
    }

    // USDC transferChecked instruction
    splInstructions.push(
      createTransferCheckedInstruction(
        customerAta,
        usdcMintPubkey,
        merchantAta,
        customerPubkey,
        amountLamports,
        USDC_DECIMALS
      )
    )

    return {
      totalUsdc,
      blockhash,
      lastValidBlockHeight: lastValidBlockHeight.toString(),
      feePayer: FEE_PAYER_PUBKEY,
      merchantWallet: merchant.walletAddress,
      menuItems: menuItems.map((m: { id: string; name: string; priceUsdc: number }) => ({
        id: m.id,
        name: m.name,
        priceUsdc: m.priceUsdc
      })),
      // raw instructions for frontend to build tx
      instructions: splInstructions.map(ix => ({
        programId: ix.programId.toBase58(),
        keys: ix.keys.map(k => ({
          pubkey: k.pubkey.toBase58(),
          isSigner: k.isSigner,
          isWritable: k.isWritable,
        })),
        data: Buffer.from(ix.data).toString('base64'),
      }))
    }
  },

  async submitToKora(serializedTx: string) {
    const res = await fetch(KORA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'signAndSendTransaction',
        params: {
          transaction: serializedTx,
          skipPreflight: true,
        }
      })
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error.message ?? 'KORA_ERROR')
    return data.result as { signature: string }
  },

  async saveOrder(data: {
    merchantId: string
    tableId: string
    customerWallet: string
    totalUsdc: number
    txSignature: string
    items: { menuItemId: string; quantity: number; name: string; priceUsdc: number }[]
  }) {
    return prisma.order.create({
      data: {
        merchantId: data.merchantId,
        tableId: data.tableId,
        customerWallet: data.customerWallet,
        totalUsdc: data.totalUsdc,
        txSignature: data.txSignature,
        status: 'CONFIRMED',
        orderItems: {
          create: data.items.map(i => ({
            menuItemId: i.menuItemId,
            name: i.name,
            priceUsdc: i.priceUsdc,
            quantity: i.quantity,
          }))
        }
      },
      include: { orderItems: true }
    })
  }
}
