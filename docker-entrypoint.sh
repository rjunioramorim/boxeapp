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

# Usar o drizzle-kit do node_modules/.bin
if [ -f "./node_modules/.bin/drizzle-kit" ]; then
  echo "✅ drizzle-kit encontrado"
  ./node_modules/.bin/drizzle-kit push --verbose
else
  echo "❌ drizzle-kit não encontrado!"
  echo "📁 Conteúdo de node_modules/.bin:"
  ls -la ./node_modules/.bin/ || echo "Diretório não existe"
  exit 1
fi

if [ $? -eq 0 ]; then
  echo "✅ Migrations concluídas com sucesso!"
else
  echo "❌ Erro ao executar migrations!"
  exit 1
fi

# Verificar se o banco está vazio e executar seed (opcional)
echo "🌱 Verificando se precisa executar seed..."

# Você pode adicionar uma verificação aqui
# Por exemplo, verificar se existe algum usuário no banco
# Se o seed script existir, execute-o
if [ -f "./scripts/seed.js" ]; then
  echo "📝 Script de seed encontrado, verificando necessidade..."
  # Adicione lógica de verificação aqui se necessário
  node scripts/check-and-seed.js
else
  echo "ℹ️ Script de seed não encontrado, pulando..."
fi

echo "🎯 Iniciando servidor Next.js..."
exec node server.js