// app/dashboard/DashboardClient.tsx
"use client";

import { ColorPicker } from "@/components/forms/ColorPicker";
import { EmojiSelector } from "@/components/forms/EmojiSelector";
import { MoodGraph } from "@/components/forms/MoodGraph";
import { PlaylistGenerator } from "@/components/playlists/PlaylistGenerator";
import { AudioFeatureTargets, PlaylistDTO } from "@/lib/types/common";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

type MoodType = "color" | "emoji" | "emotion" | "coordinate";

export default function DashboardClient() {
  const { data: session } = useSession();
  const [currentMood, setCurrentMood] = useState<MoodType>("color");
  const [moodData, setMoodData] = useState<any>(null);
  const [audioTargets, setAudioTargets] = useState<AudioFeatureTargets | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] =
    useState<PlaylistDTO | null>(null);
  const [emotionInput, setEmotionInput] = useState("");
  const [autoSaveToSpotify, setAutoSaveToSpotify] = useState(false);

  const moodTabs = [
    {
      id: "color",
      label: "Cores",
      icon: "🎨",
      description: "Escolha uma cor que representa seu mood",
    },
    {
      id: "emoji",
      label: "Emojis",
      icon: "😊",
      description: "Use emojis para expressar suas vibes",
    },
    {
      id: "emotion",
      label: "Emoções",
      icon: "🧠",
      description: "Descreva como você está se sentindo",
    },
    {
      id: "coordinate",
      label: "Mood Graph",
      icon: "📊",
      description: "Gráfico interativo para definir seu humor",
    },
  ];

  const handleColorSelect = (color: string) => {
    setMoodData(color);
  };

  const handleEmojiSelect = (emojis: string[]) => {
    setMoodData(emojis);
  };

  const handleEmotionSubmit = () => {
    if (emotionInput.trim()) {
      setMoodData(emotionInput.trim());
    }
  };

  const handleCoordinateSelect = (
    coordinates: { x: number; y: number },
    targets: AudioFeatureTargets
  ) => {
    setMoodData(coordinates);
    setAudioTargets(targets);
  };

  const handleGeneratePlaylist = async () => {
    console.log("🎵 Iniciando geração de playlist...");
    console.log("📊 Mood atual:", currentMood);
    console.log("📦 Dados do mood:", moodData);

    if (!moodData || !session?.accessToken) {
      console.error("❌ Dados insuficientes:", {
        moodData,
        hasToken: !!session?.accessToken,
      });
      return;
    }

    setIsGenerating(true);
    try {
      const moodInput = {
        type: currentMood,
        value: moodData,
      };

      console.log("📤 Enviando para API:", JSON.stringify(moodInput, null, 2));

      const response = await fetch("/api/playlists/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moodInput,
          targetSize: 30,
          saveToSpotify: autoSaveToSpotify,
        }),
      });

      console.log("📡 Resposta da API:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erro da API:", errorData);

        if (response.status === 401) {
          // Token expirado, fazer logout
          await signOut({ callbackUrl: "/auth/signin" });
          return;
        }

        throw new Error(errorData.error || "Erro ao gerar playlist");
      }

      const playlist = await response.json();
      console.log("✅ Playlist recebida:", playlist);
      setGeneratedPlaylist(playlist);
    } catch (error: any) {
      console.error("💥 Erro ao gerar playlist:", error);

      if (
        error.message.includes("Token expirado") ||
        error.message.includes("Não autenticado")
      ) {
        await signOut({ callbackUrl: "/auth/signin" });
        return;
      }

      alert(`Erro ao gerar playlist: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderMoodSelector = () => {
    switch (currentMood) {
      case "color":
        return (
          <ColorPicker onColorSelect={handleColorSelect} className="w-full" />
        );

      case "emoji":
        return (
          <EmojiSelector
            onEmojiSelect={handleEmojiSelect}
            maxSelection={3}
            className="w-full"
          />
        );

      case "emotion":
        return (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Descreva suas Emoções
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Escreva como você está se sentindo e a IA interpretará para criar
              sua playlist
            </p>
            <textarea
              value={emotionInput}
              onChange={(e) => setEmotionInput(e.target.value)}
              placeholder="Ex: Estou me sentindo nostálgico, lembrando de momentos especiais do passado..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">
                {emotionInput.length}/500 caracteres
              </span>
              <button
                onClick={handleEmotionSubmit}
                disabled={!emotionInput.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Interpretar Emoção
              </button>
            </div>
          </div>
        );

      case "coordinate":
        return (
          <MoodGraph onMoodSelect={handleCoordinateSelect} className="w-full" />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                🎵
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Spotify AI Music Discovery
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {session?.user?.name && (
                <span className="text-sm text-gray-600">
                  Olá, {session.user.name}!
                </span>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seletor de Mood */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {moodTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCurrentMood(tab.id as MoodType);
                      setMoodData(null);
                      setAudioTargets(null);
                      setGeneratedPlaylist(null);
                    }}
                    className={`
                      p-3 rounded-lg text-center transition-all duration-200
                      ${
                        currentMood === tab.id
                          ? "bg-purple-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className="text-lg mb-1">{tab.icon}</div>
                    <div className="text-sm font-medium">{tab.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição do mood atual */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-6">
              <p className="text-purple-800 font-medium">
                {moodTabs.find((tab) => tab.id === currentMood)?.description}
              </p>
            </div>

            {/* Seletor de mood */}
            {renderMoodSelector()}

            {/* Botão de gerar playlist */}
            {moodData && (
              <div className="mt-6 space-y-4">
                {/* Opção de salvar automaticamente */}
                <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <input
                    type="checkbox"
                    id="autoSave"
                    checked={autoSaveToSpotify}
                    onChange={(e) => setAutoSaveToSpotify(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor="autoSave"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Salvar automaticamente no Spotify
                  </label>
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleGeneratePlaylist}
                    disabled={isGenerating || !session?.accessToken}
                    className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {autoSaveToSpotify
                          ? "Gerando e Salvando..."
                          : "Gerando Playlist..."}
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {autoSaveToSpotify
                          ? "Gerar e Salvar no Spotify"
                          : "Gerar Playlist"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Playlist gerada */}
          {generatedPlaylist && (
            <div className="lg:col-span-1">
              <PlaylistGenerator playlist={generatedPlaylist} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
