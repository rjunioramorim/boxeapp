---
name: integration-testing
description: Skill para criação de testes de integração envolvendo Server Actions, repositories e banco de dados.
---

# Integration Testing Skill

## When to Use
- Testar Server Actions
- Testar repositories
- Validar integração com PostgreSQL
- Testar regras que envolvem persistência

## Instructions
- Use Vitest para testes de integração
- Use banco isolado (test database)
- Executar migrations antes dos testes
- Limpar dados após cada teste
- Não mockar repositories
- Validar efeitos colaterais reais