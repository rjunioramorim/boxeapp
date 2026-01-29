---
name: zustand-store
description: Skill para gerenciamento de estado client-side usando Zustand em aplicações Next.js 16.
---

# Zustand Store Skill

## When to Use
- Gerenciar estado global client-side
- Compartilhar estado entre Client Components
- Controlar UI state (modals, filtros, seleção, loading local)

## Instructions
- Zustand deve ser usado apenas em Client Components
- Stores devem ficar em `src/stores`
- Cada store deve ter responsabilidade única
- Não usar Zustand para:
  - Dados persistentes
  - Lógica de negócio
  - Estado derivado do backend
- Preferir Server Actions para dados
- Stores devem ser tipadas
- Evitar stores gigantes
- Resetar estado quando necessário (logout, troca de contexto)

## Example Responsibilities
- UI state
- Filtros
- Seleções temporárias
- Flags de interface