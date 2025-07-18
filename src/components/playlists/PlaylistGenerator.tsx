"use client";

import { PlaylistDTO } from "@/lib/types/common";
import {
  Clock,
  ExternalLink,
  Music,
  Pause,
  Play,
  Save,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface PlaylistGeneratorProps {
  playlist: PlaylistDTO;
}

export function PlaylistGenerator({ playlist }: PlaylistGeneratorProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const handlePlayPause = (trackId: string, previewUrl?: string) => {
    if (!previewUrl) {
      alert("Preview não disponível para esta música");
      return;
    }

    if (currentlyPlaying === trackId) {
      // Pausar música atual
      if (audioElement) {
        audioElement.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      // Parar música anterior se existir
      if (audioElement) {
        audioElement.pause();
      }

      // Tocar nova música
      const audio = new Audio(previewUrl);
      audio.play();
      setAudioElement(audio);
      setCurrentlyPlaying(trackId);

      // Parar automaticamente quando terminar
      audio.addEventListener("ended", () => {
        setCurrentlyPlaying(null);
      });
    }
  };

  const handleSaveToSpotify = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/playlists/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistId: playlist.id,
          name: playlist.name,
          description: playlist.description,
          saveToSpotify: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar playlist");
      }

      alert("Playlist salva no Spotify com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar playlist:", error);
      alert("Erro ao salvar playlist no Spotify");
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalDuration = () => {
    const totalMs = playlist.tracks.reduce(
      (sum, track) => sum + track.durationMs,
      0
    );
    const minutes = Math.floor(totalMs / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getAverageFeatures = () => {
    const features = playlist.tracks.reduce(
      (acc, track) => {
        acc.energy += track.audioFeatures.energy;
        acc.valence += track.audioFeatures.valence;
        acc.danceability += track.audioFeatures.danceability;
        return acc;
      },
      { energy: 0, valence: 0, danceability: 0 }
    );

    const count = playlist.tracks.length;
    return {
      energy: Math.round((features.energy / count) * 100),
      valence: Math.round((features.valence / count) * 100),
      danceability: Math.round((features.danceability / count) * 100),
    };
  };

  const avgFeatures = getAverageFeatures();

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header da Playlist */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 truncate">
            {playlist.name}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleSaveToSpotify}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-2 bg-spotify-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{playlist.description}</p>

        {/* Estatísticas da Playlist */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Music className="w-4 h-4" />
            <span>{playlist.tracks.length} músicas</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{getTotalDuration()}</span>
          </div>
        </div>

        {/* Características Médias */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Energy</span>
            <span className="font-medium">{avgFeatures.energy}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${avgFeatures.energy}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Valence</span>
            <span className="font-medium">{avgFeatures.valence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${avgFeatures.valence}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Danceability</span>
            <span className="font-medium">{avgFeatures.danceability}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${avgFeatures.danceability}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Lista de Músicas */}
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-1">
          {playlist.tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
            >
              {/* Número da música */}
              <div className="w-8 text-center text-sm text-gray-500">
                {index + 1}
              </div>

              {/* Capa do álbum */}
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                {track.albumImage ? (
                  <img
                    src={track.albumImage}
                    alt={track.album}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <Music className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Informações da música */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 truncate text-sm">
                  {track.name}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {track.artists.join(", ")}
                </p>
                <p className="text-xs text-gray-500 truncate">{track.album}</p>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Popularidade */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>{track.popularity}</span>
                </div>

                {/* Duração */}
                <span className="text-xs text-gray-500 min-w-[2.5rem]">
                  {formatDuration(track.durationMs)}
                </span>

                {/* Botão de play/pause */}
                <button
                  onClick={() => handlePlayPause(track.id, track.previewUrl)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  disabled={!track.previewUrl}
                >
                  {currentlyPlaying === track.id ? (
                    <Pause className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Play className="w-4 h-4 text-gray-600" />
                  )}
                </button>

                {/* Link para Spotify */}
                {track.spotifyUri && (
                  <button
                    onClick={() =>
                      window.open(
                        `https://open.spotify.com/track/${track.id}`,
                        "_blank"
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Playlist gerada com IA • Baseada no seu mood:{" "}
            {typeof playlist.moodInput.value === "string"
              ? playlist.moodInput.value
              : `Coordenadas (${playlist.moodInput.value.x}, ${playlist.moodInput.value.y})`}{" "}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(playlist.createdAt).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
