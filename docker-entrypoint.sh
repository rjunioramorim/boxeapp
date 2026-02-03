#!/bin/sh
# docker-entrypoint.sh

set -e

echo "🚀 Iniciando aplicação..."

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL não está definida!"
  exit 1
fi

echo "📦 Executando migrations..."
npx drizzle-kit push

# Verificar se o banco está vazio (opcional - ajuste conforme sua necessidade)
echo "🌱 Verificando se precisa executar seed..."
# Você pode adicionar uma verificação aqui, por exemplo:
# NODE_ENV=production node scripts/check-and-seed.js

echo "✅ Migrations concluídas!"

echo "🎯 Iniciando servidor Next.js..."
exec node server.js