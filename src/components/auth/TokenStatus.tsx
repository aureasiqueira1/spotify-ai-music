// components/auth/TokenStatus.tsx
"use client";

import { signIn } from "next-auth/react";
import { useSpotifyToken } from "../../hooks/useSpotifyTokens";

export default function TokenStatus() {
  const { tokenStatus, refreshToken, isChecking, isExpired, isInvalid } =
    useSpotifyToken();

  // Não mostrar nada se o token estiver válido
  if (tokenStatus === "valid") return null;

  // Mostrar indicador de carregamento
  if (isChecking) {
    return (
      <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Verificando token...</span>
      </div>
    );
  }

  // Mostrar alerta se o token expirou
  if (isExpired) {
    return (
      <div className="fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 z-50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Token expirado</span>
        </div>
        <button
          onClick={refreshToken}
          className="bg-white text-orange-500 px-3 py-1 rounded text-sm font-medium hover:bg-orange-50"
        >
          Renovar
        </button>
      </div>
    );
  }

  // Mostrar alerta se o token for inválido
  if (isInvalid) {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 z-50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>Sessão inválida</span>
        </div>
        <button
          onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
          className="bg-white text-red-500 px-3 py-1 rounded text-sm font-medium hover:bg-red-50"
        >
          Entrar
        </button>
      </div>
    );
  }

  return null;
}
