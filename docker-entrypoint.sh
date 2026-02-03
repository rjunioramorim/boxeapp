#!/bin/sh
# docker-entrypoint.sh

set -e

echo "🚀 Iniciando aplicação..."

# Verificar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL não está definida!"
  exit 1
fi

echo "✅ DATABASE_URL configurada"
echo ""
echo "📦 Executando migrations..."

# Executar migrations
./node_modules/.bin/drizzle-kit push --verbose

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migrations concluídas com sucesso!"
else
  echo ""
  echo "❌ Erro ao executar migrations!"
  exit 1
fi

# Opcional: Executar seed se necessário
# if [ -f "./scripts/seed.js" ]; then
#   echo ""
#   echo "🌱 Executando seed..."
#   node scripts/seed.js
# fi

echo ""
echo "🎯 Iniciando servidor Next.js..."
exec node server.js