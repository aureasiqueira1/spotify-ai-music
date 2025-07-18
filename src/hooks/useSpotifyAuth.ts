import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useSpotifyAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Verificar se houve erro de token
    if (session?.error === "RefreshAccessTokenError") {
      console.error("Token expirado, redirecionando para login");
      signOut({ callbackUrl: "/auth/signin" });
    }
  }, [session]);

  const handleAuthError = (error: string) => {
    if (error.includes("Token expirado") || error.includes("Não autenticado")) {
      signOut({ callbackUrl: "/auth/signin" });
    }
  };

  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ) => {
    if (status === "loading") {
      throw new Error("Carregando sessão...");
    }

    if (!session?.accessToken) {
      throw new Error("Não autenticado");
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (response.status === 401) {
        const errorData = await response.json();
        handleAuthError(errorData.error);
        throw new Error(errorData.error);
      }

      return response;
    } catch (error) {
      console.error("Erro na requisição autenticada:", error);
      throw error;
    }
  };

  return {
    session,
    status,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
    isLoading: status === "loading",
    login: signIn,
    logout: signOut,
    makeAuthenticatedRequest,
    handleAuthError,
  };
}
