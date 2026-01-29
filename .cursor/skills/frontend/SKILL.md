---
name: next16-frontend
description: Skill para criação e manutenção de páginas e layouts usando Next.js 16 com App Router e Server Components.

---

# Next.js 16 Frontend Skill

## When to Use
- Criar ou modificar páginas (`page.tsx`)
- Criar layouts (`layout.tsx`)
- Implementar loading, error e not-found
- Trabalhar com Server Components e streaming

## Instructions
- Use exclusivamente o App Router (`/app`)
- Server Components são o padrão
- Use `"use client"` apenas quando houver:
  - Estado local
  - Eventos
  - Integração com store (Zustand)
- Nunca coloque lógica de negócio em componentes
- Prefira data fetching no servidor
- Use cache e revalidação conscientemente
- Tipagem estrita sempre