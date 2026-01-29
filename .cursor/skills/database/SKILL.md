---
name: drizzle-database
description: Skill para modelagem e acesso ao banco de dados usando Drizzle ORM e PostgreSQL.
---

# Database Skill

## When to Use
- Criar ou alterar schemas
- Criar migrations
- Criar queries

## Instructions
- Schemas em `src/db/schema`
- Migrations versionadas
- Nunca acessar banco fora de repositories
- Queries devem ser type-safe
- Use relations explicitamente
- Use transações quando necessário