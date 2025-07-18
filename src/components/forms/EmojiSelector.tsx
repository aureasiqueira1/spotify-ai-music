"use client";

import { EMOJI_MAPPINGS } from "@/lib/utils/mappings";
import { useState } from "react";

interface EmojiSelectorProps {
  onEmojiSelect: (emojis: string[]) => void;
  maxSelection?: number;
  className?: string;
}

export function EmojiSelector({
  onEmojiSelect,
  maxSelection = 3,
  className = "",
}: EmojiSelectorProps) {
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);

  const emojiCategories = {
    Emoções: ["😊", "😢", "😍", "😌", "😤", "🤩", "😴", "🤗"],
    Atividades: ["💃", "🏃", "🧘", "🎵", "🎉", "📚", "💻", "🎮"],
    Natureza: ["🌞", "🌙", "🌊", "🔥", "⚡", "🌈", "🌸", "🌟"],
    Objetos: ["🎭", "🎪", "🚀", "💎", "⚙️", "🎨", "🎯", "🎲"],
  };

  const supportedEmojis = Object.keys(EMOJI_MAPPINGS);

  const handleEmojiClick = (emoji: string) => {
    if (selectedEmojis.includes(emoji)) {
      // Remove emoji
      const newSelection = selectedEmojis.filter((e) => e !== emoji);
      setSelectedEmojis(newSelection);
      onEmojiSelect(newSelection);
    } else if (selectedEmojis.length < maxSelection) {
      // Adiciona emoji
      const newSelection = [...selectedEmojis, emoji];
      setSelectedEmojis(newSelection);
      onEmojiSelect(newSelection);
    }
  };

  const clearSelection = () => {
    setSelectedEmojis([]);
    onEmojiSelect([]);
  };

  const getEmojiDescription = (emoji: string): string => {
    const descriptions: Record<string, string> = {
      "💃": "Dança - Alta energia e diversão",
      "😭": "Tristeza - Melancólico e introspectivo",
      "🔥": "Intensidade - Energia máxima",
      "🌊": "Calma - Fluido e relaxante",
      "⚡": "Energia - Elétrico e vibrante",
      "🌙": "Noturno - Sonhador e misterioso",
      "☀️": "Alegria - Brilhante e positivo",
      "🎭": "Dramático - Teatral e expressivo",
      "❤️": "Amor - Romântico e caloroso",
      "🌈": "Diversidade - Colorido e variado",
      "🎵": "Musical - Melódico e harmônico",
      "🚀": "Futurista - Espacial e inovador",
    };

    return descriptions[emoji] || "Emoji personalizado";
  };

  return (
    <div className={`emoji-selector ${className}`}>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          Selecione até {maxSelection} Emojis
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Cada emoji representa diferentes vibes musicais
        </p>

        {/* Emojis selecionados */}
        {selectedEmojis.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-purple-800">Selecionados</h4>
              <button
                onClick={clearSelection}
                className="text-xs text-purple-600 hover:text-purple-800 underline"
              >
                Limpar
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              {selectedEmojis.map((emoji, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-purple-300"
                >
                  <span className="text-lg">{emoji}</span>
                  <button
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-xs text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-xs text-purple-700">
              {selectedEmojis.map((emoji, index) => (
                <p key={index}>{getEmojiDescription(emoji)}</p>
              ))}
            </div>
          </div>
        )}

        {/* Emojis suportados destacados */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Emojis com IA Especializada
          </h4>
          <div className="grid grid-cols-6 gap-2">
            {supportedEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                disabled={
                  !selectedEmojis.includes(emoji) &&
                  selectedEmojis.length >= maxSelection
                }
                className={`
                  relative w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 text-xl
                  ${
                    selectedEmojis.includes(emoji)
                      ? "border-purple-500 bg-purple-100 ring-2 ring-purple-200"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  }
                  ${
                    !selectedEmojis.includes(emoji) &&
                    selectedEmojis.length >= maxSelection
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
                title={getEmojiDescription(emoji)}
              >
                {emoji}
                {selectedEmojis.includes(emoji) && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {selectedEmojis.indexOf(emoji) + 1}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Categorias de emojis */}
        <div className="space-y-4">
          {Object.entries(emojiCategories).map(([category, emojis]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {category}
              </h4>
              <div className="grid grid-cols-8 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    disabled={
                      !selectedEmojis.includes(emoji) &&
                      selectedEmojis.length >= maxSelection
                    }
                    className={`
                      relative w-10 h-10 rounded-lg border transition-all duration-200 hover:scale-110 text-lg
                      ${
                        selectedEmojis.includes(emoji)
                          ? "border-purple-500 bg-purple-100"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }
                      ${
                        !selectedEmojis.includes(emoji) &&
                        selectedEmojis.length >= maxSelection
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                      ${
                        supportedEmojis.includes(emoji)
                          ? "ring-2 ring-yellow-200"
                          : ""
                      }
                    `}
                    title={
                      supportedEmojis.includes(emoji)
                        ? `${emoji} (IA especializada)`
                        : emoji
                    }
                  >
                    {emoji}
                    {selectedEmojis.includes(emoji) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {selectedEmojis.indexOf(emoji) + 1}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-600">💡</span>
            <span className="text-sm font-medium text-yellow-800">Dica</span>
          </div>
          <p className="text-xs text-yellow-700">
            Emojis com borda dourada têm interpretação especializada de IA.
            Combine até {maxSelection} emojis para criar vibes únicas!
          </p>
        </div>
      </div>
    </div>
  );
}
