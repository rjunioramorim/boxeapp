# Dockerfile (versão mais simples e confiável)
FROM node:20-alpine AS base

# ============================================
# DEPS STAGE
# ============================================
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ============================================
# BUILDER STAGE
# ============================================
FROM base AS builder
WORKDIR /app

ENV SKIP_ENV_VALIDATION=1
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./
COPY next.config.* ./
COPY tailwind.config.* ./
COPY tsconfig.json ./
COPY postcss.config.* ./
COPY drizzle.config.ts ./
COPY src ./src
COPY public ./public
COPY drizzle ./drizzle
COPY scripts ./scripts

RUN npm run build

# ============================================
# PROD DEPS - Apenas dependências de produção + drizzle
# ============================================
FROM base AS prod-deps
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./

# Instalar deps de produção
RUN npm ci --omit=dev

# Instalar drizzle-kit separadamente (é devDependency)
RUN npm install drizzle-kit

# ============================================
# RUNNER STAGE
# ============================================
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache \
    curl \
    ca-certificates \
    libc6-compat \
    openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

ENV HOME=/home/nextjs

RUN mkdir -p .next && chown -R nextjs:nodejs .next

# Package.json
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Next.config
COPY --from=builder --chown=nextjs:nodejs /app/next.config.* ./

# Public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Next.js build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts

# Scripts
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# Node_modules de produção (inclui drizzle-kit)
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Script de inicialização
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Verificar se drizzle-kit está disponível
RUN echo "✅ Verificando drizzle-kit:" && \
    ls -la node_modules/.bin/drizzle-kit && \
    ls -la node_modules/drizzle-kit/

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]