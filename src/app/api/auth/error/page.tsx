"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Erro de configuração do servidor.";
      case "AccessDenied":
        return "Acesso negado. Você precisa autorizar o acesso ao Spotify.";
      case "Verification":
        return "Token de verificação expirado.";
      default:
        return "Ocorreu um erro durante a autenticação.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-2xl mx-auto mb-4">
            ⚠️
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Erro de Autenticação
          </h1>
          <p className="text-gray-600">{getErrorMessage(error)}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Erro: {error || "Desconhecido"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
