This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Ambiente local

1. **Variáveis de ambiente**  
   Copie o exemplo e ajuste se precisar:  
   `cp .env.example .env.local`  
   O `.env.example` já traz `DATABASE_URL=postgresql://boxeapp:boxeapp@localhost:5432/boxeapp` para uso com o Postgres em Docker.

2. **Subir só o Postgres (app no host)**  
   ```bash
   docker compose -f docker-compose.dev.yml up -d postgres
   ```  
   Depois: `npm run dev` e `npm run db:migrate` (com `.env.local` apontando para `localhost:5432`).

3. **Ou subir app + Postgres em containers**  
   ```bash
   docker compose up -d
   ```

## Getting Started

Primeiro, tenha o Postgres rodando (passo 2 acima). Depois:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
