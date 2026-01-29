---
name: server-actions
description: Skill para criação de Server Actions seguras e previsíveis usando Next.js 16.
---

# Server Actions Skill

## When to Use
- Criar mutações
- Processar formulários
- Orquestrar regras de negócio

## Instructions
- Toda mutation deve ser uma Server Action
- Validar input com Zod
- Nunca confiar em dados do client
- Retornar erros tipados
- Actions devem ser pequenas
- Não acessar banco diretamente sem repository