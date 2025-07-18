"use client";

import { ColorPicker } from "@/components/forms/ColorPicker";
import { EmojiSelector } from "@/components/forms/EmojiSelector";
import { MoodGraph } from "@/components/forms/MoodGraph";
import { AudioFeatureTargets, PlaylistDTO } from "@/lib/types/common";
import { useState } from "react";
import { PlaylistGenerator } from "../../components/playlists/PlaylistGenerator";

type MoodType = "color" | "emoji" | "emotion" | "coordinate";

export default function DashboardPage() {
  const [currentMood, setCurrentMood] = useState<MoodType>("color");
  const [moodData, setMoodData] = useState<any>(null);
  const [audioTargets, setAudioTargets] = useState<AudioFeatureTargets | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] =
    useState<PlaylistDTO | null>(null);
  const [emotionInput, setEmotionInput] = useState("");

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
    // AudioTargets serão calculados no backend
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
    if (!moodData) return;

    setIsGenerating(true);
    try {
      const moodInput = {
        type: currentMood,
        value: moodData,
      };

      const response = await fetch("/api/playlists/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moodInput,
          targetSize: 30,
          saveToSpotify: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar playlist");
      }

      const playlist = await response.json();
      setGeneratedPlaylist(playlist);
    } catch (error: any) {
      console.error("Erro ao gerar playlist:", error);
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
            <button
              onClick={() =>
                (window.location.href = "/api/auth/spotify/logout")
              }
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Sair
            </button>
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
              <div className="mt-6 text-center">
                <button
                  onClick={handleGeneratePlaylist}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-spotify-green text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Gerando Playlist...
                    </>
                  ) : (
                    "Gerar Playlist"
                  )}
                </button>
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
