"use client";

import { COLOR_MAPPINGS } from "@/lib/utils/mappings";
import { useState } from "react";

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
  className?: string;
}

export function ColorPicker({
  onColorSelect,
  className = "",
}: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("#FF0000");

  const predefinedColors = Object.keys(COLOR_MAPPINGS);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
  };

  const handleCustomColorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const color = event.target.value;
    setCustomColor(color);
    setSelectedColor(color);
    onColorSelect(color);
  };

  const getColorDescription = (color: string): string => {
    const colorNames: Record<string, string> = {
      "#FF0000": "Vermelho - Energia e Paixão",
      "#0000FF": "Azul - Calma e Introspecção",
      "#FFFF00": "Amarelo - Alegria e Dança",
      "#800080": "Roxo - Mistério e Eletrônico",
      "#FFA500": "Laranja - Energia e Calor",
      "#008000": "Verde - Natureza e Equilíbrio",
      "#FFC0CB": "Rosa - Romance e Suavidade",
      "#000000": "Preto - Intensidade e Drama",
      "#FFFFFF": "Branco - Pureza e Minimalismo",
    };

    return colorNames[color] || "Cor personalizada";
  };

  return (
    <div className={`color-picker ${className}`}>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          Escolha uma Cor
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Cada cor representa diferentes características musicais
        </p>

        {/* Cores predefinidas */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {predefinedColors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className={`relative w-full h-16 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                selectedColor === color
                  ? "border-purple-500 ring-4 ring-purple-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={getColorDescription(color)}
            >
              {selectedColor === color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Seletor de cor customizada */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ou escolha uma cor personalizada:
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e as any)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="#FF0000"
            />
          </div>
        </div>

        {/* Descrição da cor selecionada */}
        {selectedColor && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">
              Cor Selecionada
            </h4>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: selectedColor }}
              ></div>
              <span className="text-sm text-purple-700">
                {getColorDescription(selectedColor)}
              </span>
            </div>

            {/* Mostrar características de áudio */}
            {COLOR_MAPPINGS[selectedColor] && (
              <div className="mt-3 space-y-1 text-xs text-purple-600">
                <p className="font-medium">Características musicais:</p>
                {Object.entries(COLOR_MAPPINGS[selectedColor]).map(
                  ([feature, range]) => (
                    <div key={feature} className="flex justify-between">
                      <span className="capitalize">{feature}:</span>
                      <span>
                        {range.target
                          ? `${Math.round(range.target * 100)}%`
                          : `${Math.round(range.min * 100)}-${Math.round(
                              range.max * 100
                            )}%`}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Paleta de cores sugeridas */}
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Paletas Sugeridas
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Energético</p>
              <div className="flex gap-1">
                {["#FF0000", "#FFA500", "#FFFF00"].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Calmo</p>
              <div className="flex gap-1">
                {["#0000FF", "#008000", "#FFC0CB"].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
