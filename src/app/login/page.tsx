"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleSpotifyLogin = () => {
    window.location.href = "/api/auth/spotify/login";
  };

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "access_denied":
        return "Acesso negado. Você precisa autorizar o acesso para continuar.";
      case "missing_code":
        return "Código de autorização não encontrado. Tente novamente.";
      case "auth_failed":
        return "Falha na autenticação. Verifique suas credenciais e tente novamente.";
      default:
        return error ? "Erro desconhecido na autenticação." : null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            🎵
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Spotify AI Music
          </h1>
          <p className="text-gray-600">
            Descubra música através de cores, emojis e emoções
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-red-800 font-medium">
                Erro de Autenticação
              </span>
            </div>
            <p className="text-red-700 text-sm">{getErrorMessage(error)}</p>
          </div>
        )}

        {/* Funcionalidades */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              🎨
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Mood por Cores</h3>
              <p className="text-sm text-gray-600">
                Escolha cores que representam seu estado de espírito
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              😊
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Vibes por Emojis</h3>
              <p className="text-sm text-gray-600">
                Use emojis para expressar o que você sente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              🧠
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">IA Emocional</h3>
              <p className="text-sm text-gray-600">
                Descreva suas emoções e deixe a IA interpretar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              📊
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Mood Graph</h3>
              <p className="text-sm text-gray-600">
                Gráfico interativo para definir seu humor musical
              </p>
            </div>
          </div>
        </div>

        {/* Botão de login */}
        <button
          onClick={handleSpotifyLogin}
          className="w-full bg-spotify-green hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Entrar com Spotify
        </button>

        {/* Informações adicionais */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Ao fazer login, você concorda com nossos termos de uso e política de
            privacidade.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            É necessário ter uma conta Spotify (gratuita ou premium).
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
          <div className="text-white text-xl">Carregando...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
