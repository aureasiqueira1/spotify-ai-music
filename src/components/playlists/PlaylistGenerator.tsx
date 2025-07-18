"use client";

import { PlaylistDTO } from "@/lib/types/common";
import { useState } from "react";

interface PlaylistGeneratorProps {
  playlist: PlaylistDTO;
}

export function PlaylistGenerator({ playlist }: PlaylistGeneratorProps) {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedPlaylist, setSavedPlaylist] = useState<any>(null);

  const handleSaveToSpotify = async () => {
    if (savedPlaylist) {
      // Se já foi salva, abrir no Spotify
      window.open(savedPlaylist.external_urls.spotify, "_blank");
      return;
    }

    setIsSaving(true);
    try {
      console.log("💾 Salvando playlist no Spotify...");

      const response = await fetch("/api/playlists/save-to-spotify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlist: playlist,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erro ao salvar:", errorData);
        throw new Error(errorData.error || "Erro ao salvar playlist");
      }

      const result = await response.json();
      console.log("✅ Playlist salva:", result);

      setSavedPlaylist(result.playlist);

      // Mostrar mensagem de sucesso
      alert(`Playlist "${result.playlist.name}" salva com sucesso no Spotify!`);
    } catch (error: any) {
      console.error("💥 Erro ao salvar playlist:", error);
      alert(`Erro ao salvar playlist: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  const handlePlayPreview = (previewUrl: string | null, trackId: string) => {
    if (!previewUrl) {
      alert("Preview não disponível para esta música");
      return;
    }

    // Parar audio atual se estiver tocando
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }

    if (isPlaying === trackId) {
      setIsPlaying(null);
      return;
    }

    const audio = new Audio(previewUrl);
    audio.addEventListener("ended", () => {
      setIsPlaying(null);
      setCurrentAudio(null);
    });

    audio.play();
    setCurrentAudio(audio);
    setIsPlaying(trackId);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getPlaylistStats = () => {
    const totalDuration = playlist.tracks.reduce(
      (acc, track) => acc + (track.duration_ms || 0),
      0
    );
    const totalHours = Math.floor(totalDuration / 3600000);
    const totalMinutes = Math.floor((totalDuration % 3600000) / 60000);

    const avgPopularity =
      playlist.tracks.length > 0
        ? Math.round(
            playlist.tracks.reduce(
              (acc, track) => acc + (track.popularity || 0),
              0
            ) / playlist.tracks.length
          )
        : 0;

    return {
      totalDuration:
        totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`,
      avgPopularity,
      trackCount: playlist.tracks.length,
    };
  };

  const stats = getPlaylistStats();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {playlist.name}
        </h2>
        <p className="text-gray-600 text-sm mb-4">{playlist.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-800">
              {stats.trackCount}
            </div>
            <div className="text-xs text-purple-600">Músicas</div>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-800">
              {stats.totalDuration}
            </div>
            <div className="text-xs text-blue-600">Duração</div>
          </div>
          <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-800">
              {stats.avgPopularity}%
            </div>
            <div className="text-xs text-green-600">Popularidade</div>
          </div>
        </div>

        {/* Success indicator */}
        {savedPlaylist && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Playlist salva no Spotify!</span>
            </div>
          </div>
        )}

        {/* Mood Info */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3 mb-4">
          <div className="text-sm font-medium text-orange-800">
            Baseado no seu mood: {playlist.moodData?.type}
          </div>
          <div className="text-xs text-orange-600">
            {playlist.moodData?.type === "color" &&
              `Cor: ${playlist.moodData.value}`}
            {playlist.moodData?.type === "emoji" &&
              `Emojis: ${playlist.moodData.value.join(" ")}`}
            {playlist.moodData?.type === "emotion" &&
              `Emoção: ${playlist.moodData.value}`}
            {playlist.moodData?.type === "coordinate" &&
              `Coordenadas: (${playlist.moodData.value.x.toFixed(
                2
              )}, ${playlist.moodData.value.y.toFixed(2)})`}
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {playlist.tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              {/* Track Number */}
              <div className="w-6 h-6 flex items-center justify-center text-sm text-gray-500">
                {index + 1}
              </div>

              {/* Play Button */}
              <button
                onClick={() => handlePlayPreview(track.preview_url, track.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  track.preview_url
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!track.preview_url}
              >
                {isPlaying === track.id ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">
                  {track.name}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {track.artists.join(", ")} • {track.album}
                </div>
              </div>

              {/* Duration & Popularity */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {track.popularity || 0}%
                </span>
                <span>{formatDuration(track.duration_ms || 0)}</span>
              </div>

              {/* External Link */}
              <a
                href={track.external_urls?.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleSaveToSpotify}
              disabled={isSaving}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                savedPlaylist
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : savedPlaylist ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  Abrir no Spotify
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  Salvar no Spotify
                </>
              )}
            </button>
            <button
              onClick={() => {
                // Implementar funcionalidade de export
                const playlistData = {
                  name: playlist.name,
                  description: playlist.description,
                  tracks: playlist.tracks.map((track) => ({
                    name: track.name,
                    artists: track.artists.join(", "),
                    album: track.album,
                    spotify_url: track.external_urls?.spotify,
                  })),
                };

                const blob = new Blob([JSON.stringify(playlistData, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${playlist.name.replace(
                  /[^a-z0-9]/gi,
                  "_"
                )}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
