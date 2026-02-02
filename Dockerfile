# ===============================
# Base
# ===============================
FROM node:20-slim AS base
WORKDIR /app

# ===============================
# Dependências (prod)
# ===============================
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# ===============================
# Dependências (dev)
# ===============================
FROM base AS deps-dev
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# ===============================
# Builder
# ===============================
FROM base AS builder
WORKDIR /app

COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run db:generate
RUN npm run build

# ===============================
# Runner (produção)
# ===============================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=deps /app/node_modules ./node_modules

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]

# ===============================
# Migration / Seed
# ===============================
FROM base AS migrate
WORKDIR /app

COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .

CMD ["sh", "-c", "npx drizzle-kit migrate && npx tsx src/db/seed.ts"]
