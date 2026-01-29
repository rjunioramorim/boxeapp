import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    // Middleware pode ser usado para lógica adicional se necessário
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Verificar se o token existe (usuário autenticado)
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/planos/:path*",
    "/aulas/:path*",
    "/alunos/:path*",
    "/pagamentos/:path*",
    "/agendamentos/:path*",
  ],
};
