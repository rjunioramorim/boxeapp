# Dockerfile Multi-Stage Otimizado para Next.js + Drizzle
# Versão com cache inteligente de dependências

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependências baseado no package-lock
FROM base AS deps

# Copiar apenas arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências de produção
RUN npm ci --only=production && \
    npm cache clean --force

# Instalar todas as dependências (incluindo dev) em outra camada
FROM base AS deps-dev
COPY package.json package-lock.json* ./
RUN npm ci && \
    npm cache clean --force

# Builder - compila a aplicação
FROM base AS builder
WORKDIR /app

# Copiar dependências com devDependencies
COPY --from=deps-dev /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Build args
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Gerar Drizzle schema e build Next.js
RUN DATABASE_URL="postgresql://postgres:docker@localhost:5432/boxeapp" npm run db:generate
RUN DATABASE_URL="postgresql://postgres:docker@localhost:5432/boxeapp" npm run build

# Runner - imagem de produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar apenas node_modules de produção
COPY --from=deps /app/node_modules ./node_modules

# Copiar arquivos do build
COPY --from=builder /app/public ./public

# Copiar output standalone do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar migrations do Drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

# Copiar configs necessários
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]