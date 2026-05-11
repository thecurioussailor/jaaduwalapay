# Jaaduwalapay

Gasless restaurant payments on Solana. Customers pay in USDC without holding any SOL — the Kora relay sponsors all transaction fees.

## What it does

Restaurants onboard with a Phantom wallet and build their menu. Each table gets a QR code. Customers scan the QR, browse the menu, and pay in USDC directly from their Solana wallet. No SOL needed, no gas fees, instant settlement.

## Live Demo

- **Merchant dashboard**: https://jaaduwalapay-web.vercel.app
- **API**: https://api.ashutoshsagar.com

## How it works

1. Merchant signs up, verifies wallet ownership via Ed25519 signature
2. Merchant creates menu categories + items (priced in USDC)
3. Merchant creates tables — each gets a unique QR code
4. Customer scans QR → sees menu → adds items to cart → connects Phantom → pays
5. Frontend builds a Solana v0 transaction with USDC transfer instructions
6. Kora relay co-signs as fee payer — customer pays zero SOL
7. Transaction confirmed on-chain, order saved to DB, merchant sees it in dashboard

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS, `@solana/wallet-adapter-react` |
| Backend | Express.js, TypeScript, tsx |
| Database | PostgreSQL (Neon) via Prisma 7 |
| Payments | USDC SPL token, `@solana/spl-token`, `@solana/web3.js` |
| Gasless relay | [Kora](https://github.com/solana-foundation/kora) by Solana Foundation |
| Monorepo | Turborepo + pnpm workspaces |
| Deployment | Vercel (frontend), Civo VPS (API + Kora via Docker) |

## Architecture

```
apps/
  web/          # Next.js merchant dashboard + customer ordering page
  api/          # Express REST API
packages/
  database/     # Prisma schema + generated client (@repo/db)
kora.toml       # Kora relay configuration
kora.Dockerfile # Docker build for Kora relay
```

## Key flows

### Gasless payment
The frontend builds a versioned Solana transaction with:
- USDC transfer instruction (customer → merchant wallet)
- Compute budget instruction

Sends to backend `/pay/build` → backend returns instructions + blockhash → frontend signs with Phantom → sends to `/pay/confirm` → backend submits to Kora relay which adds its fee payer signature → transaction lands on-chain.

### Wallet verification
Merchant proves wallet ownership: backend issues a nonce challenge → merchant signs with Phantom → backend verifies Ed25519 signature via Web Crypto API.

## Local development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm --filter @repo/db exec prisma generate

# Run database migrations
pnpm --filter @repo/db exec prisma db push

# Start API
cd apps/api && pnpm dev

# Start frontend
cd apps/web && pnpm dev

# Start Kora relay
docker build -f kora.Dockerfile -t jaaduwalapay-kora .
docker run -p 8080:8080 \
  -e SIGNER_MEMORY_PRIVATE_KEY=<your-fee-payer-private-key> \
  -e RPC_URL=https://api.devnet.solana.com \
  jaaduwalapay-kora
```

## Environment variables

**`apps/api/.env`**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
KORA_URL=http://localhost:8080
KORA_FEE_PAYER_PUBKEY=...
USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
SOLANA_RPC=https://api.devnet.solana.com
FRONTEND_URL=http://localhost:3000
```

**`apps/web/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Built for

[Colosseum Frontier Hackathon](https://arena.colosseum.org) — May 2026. Solo project.
