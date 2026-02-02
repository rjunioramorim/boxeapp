# Dockerfile Multi-Stage Otimizado para Next.js + Drizzle
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ===============================
# Dependências (prod)
# ===============================
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

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

# Build-time ENV (somente públicas)
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# ⚠️ NÃO acessa DB aqui
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

# Usuário não-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Node modules (prod)
COPY --from=deps /app/node_modules ./node_modules

# Build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

# Healthcheck (runtime only)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]
