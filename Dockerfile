# Dockerfile
FROM node:20-alpine AS base

# ============================================
# DEPS STAGE - Cache de dependências
# ============================================
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copiar APENAS package files primeiro (melhor cache)
COPY package.json package-lock.json* ./

# Install dependencies - essa layer será cacheada
RUN npm ci

# ============================================
# BUILDER STAGE
# ============================================
FROM base AS builder
WORKDIR /app

ENV SKIP_ENV_VALIDATION=1
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar node_modules do stage anterior (reutiliza cache)
COPY --from=deps /app/node_modules ./node_modules

# Copiar package files
COPY package.json package-lock.json* ./

# Copiar arquivos de configuração ANTES do source code (melhor cache)
COPY next.config.* ./
COPY tailwind.config.* ./
COPY tsconfig.json ./
COPY postcss.config.* ./
COPY drizzle.config.ts ./

# Copiar source code por último (muda com mais frequência)
COPY src ./src
COPY public ./public
COPY drizzle ./drizzle
COPY scripts ./scripts

# Build do Next.js
RUN npm run build

# Debug: Verificar se next.config existe após build
RUN ls -la && \
    ls -la .next/ && \
    echo "✅ Build concluído"

# ============================================
# MIGRATION-DEPS STAGE
# Instalar apenas dependências para migrations
# ============================================
FROM base AS migration-deps
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./

# Instalar apenas as deps críticas para migrations
RUN npm install --no-save --omit=dev \
    drizzle-orm \
    drizzle-kit \
    pg \
    postgres \
    bcryptjs

# Debug: Verificar o que foi instalado
RUN echo "✅ Dependências de migration instaladas:" && \
    ls -la node_modules/ && \
    ls -la node_modules/.bin/

# ============================================
# RUNNER STAGE - Produção otimizada
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

# Criar diretório .next com permissões corretas
RUN mkdir -p .next && chown -R nextjs:nodejs .next

# ============================================
# Copiar arquivos na ordem de prioridade
# ============================================

# 1. Package.json
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# 2. Next.config (com fallback para .js, .mjs, .ts)
COPY --from=builder --chown=nextjs:nodejs /app/next.config.* ./

# 3. Public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 4. Build do Next.js (standalone)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 5. Arquivos do Drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts

# 6. Scripts (se existir)
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# 7. Node_modules para migrations (com TODAS as dependências transitivas)
COPY --from=migration-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Script de inicialização
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Debug final: Verificar estrutura
RUN echo "✅ Estrutura final do container:" && \
    ls -la && \
    echo "" && \
    echo "✅ Verificando next.config:" && \
    ls -la next.config.* && \
    echo "" && \
    echo "✅ Verificando node_modules/.bin:" && \
    ls -la node_modules/.bin/ | head -20 && \
    echo "" && \
    echo "✅ Verificando drizzle-kit:" && \
    ls -la node_modules/.bin/drizzle-kit || echo "❌ drizzle-kit não encontrado"

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]