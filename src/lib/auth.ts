import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

/**
 * Obtém a sessão do servidor
 * Use em Server Components e Server Actions
 */
export async function getServerSession() {
  return await getServerSession(authOptions);
}

/**
 * Verifica se o usuário está autenticado
 * Redireciona para /login se não estiver
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * Obtém o ID do usuário autenticado
 * Retorna null se não estiver autenticado
 */
export async function getUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user?.id || null;
}
