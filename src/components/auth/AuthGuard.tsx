// components/auth/AuthGuard.tsx
"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    // Se não há sessão, redirecionar para login
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    // Se há erro de token, tentar renovar a sessão
    if (session?.error === "RefreshAccessTokenError") {
      console.log("Erro de token detectado, tentando renovar...");
      handleTokenError();
      return;
    }

    // Se não há accessToken, tentar renovar
    if (session && !session.accessToken) {
      console.log("AccessToken ausente, tentando renovar...");
      handleTokenError();
      return;
    }
  }, [status, session, router]);

  const handleTokenError = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    try {
      console.log("Tentando renovar sessão...");
      await update(); // Força a renovação da sessão

      // Aguardar um pouco para a renovação
      setTimeout(() => {
        setIsRetrying(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao renovar sessão:", error);
      setIsRetrying(false);
      router.push("/auth/signin");
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await signIn("spotify", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Erro ao tentar login novamente:", error);
      setIsRetrying(false);
    }
  };

  if (status === "loading" || isRetrying) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isRetrying ? "Renovando sessão..." : "Carregando..."}
            </p>
          </div>
        </div>
      )
    );
  }

  // Se há erro de token e não está tentando renovar, mostrar opção de tentar novamente
  if (session?.error === "RefreshAccessTokenError" || !session?.accessToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-2xl mx-auto mb-4">
              🔄
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Sessão Expirada
            </h1>
            <p className="text-gray-600">
              Sua sessão do Spotify expirou. Clique abaixo para renovar.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRetrying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Renovando...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  Renovar Sessão
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
