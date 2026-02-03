#!/bin/sh
# docker-entrypoint.sh

set -e

echo "🚀 Iniciando aplicação..."

# Verificar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL não está definida!"
  exit 1
fi

echo "📦 Executando migrations..."

# Verificar se drizzle-kit existe
if [ ! -f "./node_modules/.bin/drizzle-kit" ]; then
  echo "❌ drizzle-kit não encontrado!"
  echo "📁 Conteúdo de node_modules/.bin:"
  ls -la node_modules/.bin/
  exit 1
fi

echo "✅ drizzle-kit encontrado, executando migrations..."

# Executar migrations
./node_modules/.bin/drizzle-kit push --verbose

if [ $? -eq 0 ]; then
  echo "✅ Migrations concluídas com sucesso!"
else
  echo "❌ Erro ao executar migrations!"
  exit 1
fi

echo "🎯 Iniciando servidor Next.js..."
exec node server.js