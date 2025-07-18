"use client";

import { useState, useCallback } from "react";
import { AudioFeatureTargets } from "@/lib/types/common";

interface MoodGraphProps {
  onMoodSelect: (
    coordinates: { x: number; y: number },
    targets: AudioFeatureTargets
  ) => void;
  className?: string;
}

export function MoodGraph({ onMoodSelect, className = "" }: MoodGraphProps) {
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleGraphClick = useCallback(
    (event: React.MouseEvent<SVGElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height; // Inverter Y

      setSelectedPoint({ x, y });

      // Mapear coordenadas para características de áudio
      const tolerance = 0.15;
      const targets: AudioFeatureTargets = {
        danceability: {
          min: Math.max(0, x - tolerance),
          max: Math.min(1, x + tolerance),
          target: x,
        },
        acousticness: {
          min: Math.max(0, y - tolerance),
          max: Math.min(1, y + tolerance),
          target: y,
        },
        energy: {
          min: Math.max(0, x - tolerance * 0.5),
          max: Math.min(1, x + tolerance * 0.5),
          target: x,
        },
        valence: {
          min: Math.max(0, y - tolerance * 0.5),
          max: Math.min(1, y + tolerance * 0.5),
          target: y,
        },
      };

      onMoodSelect({ x, y }, targets);
    },
    [onMoodSelect]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGElement>) => {
      if (!isHovering) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;

      setHoverPoint({ x, y });
    },
    [isHovering]
  );

  const getQuadrantLabel = (x: number, y: number): string => {
    const danceability = Math.round(x * 100);
    const acousticness = Math.round(y * 100);

    if (x > 0.5 && y > 0.5)
      return `Acústico Dançante (${danceability}% - ${acousticness}%)`;
    if (x > 0.5 && y <= 0.5)
      return `Energético Dançante (${danceability}% - ${100 - acousticness}%)`;
    if (x <= 0.5 && y > 0.5)
      return `Acústico Calmo (${danceability}% - ${acousticness}%)`;
    return `Energético Calmo (${danceability}% - ${100 - acousticness}%)`;
  };

  return (
    <div className={`mood-graph ${className}`}>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          Mood Graph Interativo
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Clique em qualquer ponto para definir seu mood musical
        </p>

        <div className="relative">
          <svg
            width="100%"
            height="400"
            viewBox="0 0 400 400"
            className="border-2 border-gray-200 rounded-lg cursor-crosshair bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
            onClick={handleGraphClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              setHoverPoint(null);
            }}
            onMouseMove={handleMouseMove}
          >
            {/* Grid */}
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </pattern>
              <linearGradient
                id="energyGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#3b82f6", stopOpacity: 0.1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#ef4444", stopOpacity: 0.1 }}
                />
              </linearGradient>
              <linearGradient
                id="acousticGradient"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#10b981", stopOpacity: 0.1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#8b5cf6", stopOpacity: 0.1 }}
                />
              </linearGradient>
            </defs>

            <rect width="400" height="400" fill="url(#grid)" />

            {/* Gradientes de fundo */}
            <rect width="400" height="400" fill="url(#energyGradient)" />
            <rect width="400" height="400" fill="url(#acousticGradient)" />

            {/* Quadrantes com labels */}
            <g className="quadrant-labels">
              <text
                x="100"
                y="100"
                textAnchor="middle"
                className="text-xs font-medium fill-purple-700"
              >
                Acústico
              </text>
              <text
                x="100"
                y="115"
                textAnchor="middle"
                className="text-xs font-medium fill-purple-700"
              >
                Dançante
              </text>

              <text
                x="300"
                y="100"
                textAnchor="middle"
                className="text-xs font-medium fill-red-700"
              >
                Energético
              </text>
              <text
                x="300"
                y="115"
                textAnchor="middle"
                className="text-xs font-medium fill-red-700"
              >
                Dançante
              </text>

              <text
                x="100"
                y="300"
                textAnchor="middle"
                className="text-xs font-medium fill-blue-700"
              >
                Acústico
              </text>
              <text
                x="100"
                y="315"
                textAnchor="middle"
                className="text-xs font-medium fill-blue-700"
              >
                Calmo
              </text>

              <text
                x="300"
                y="300"
                textAnchor="middle"
                className="text-xs font-medium fill-green-700"
              >
                Energético
              </text>
              <text
                x="300"
                y="315"
                textAnchor="middle"
                className="text-xs font-medium fill-green-700"
              >
                Calmo
              </text>
            </g>

            {/* Linhas centrais */}
            <line
              x1="200"
              y1="0"
              x2="200"
              y2="400"
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.5"
            />
            <line
              x1="0"
              y1="200"
              x2="400"
              y2="200"
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.5"
            />

            {/* Ponto de hover */}
            {isHovering && hoverPoint && (
              <circle
                cx={hoverPoint.x * 400}
                cy={(1 - hoverPoint.y) * 400}
                r="6"
                fill="#6b7280"
                stroke="#fff"
                strokeWidth="2"
                opacity="0.7"
              />
            )}

            {/* Ponto selecionado */}
            {selectedPoint && (
              <g>
                <circle
                  cx={selectedPoint.x * 400}
                  cy={(1 - selectedPoint.y) * 400}
                  r="12"
                  fill="#8b5cf6"
                  stroke="#fff"
                  strokeWidth="3"
                  className="animate-pulse"
                />
                <circle
                  cx={selectedPoint.x * 400}
                  cy={(1 - selectedPoint.y) * 400}
                  r="6"
                  fill="#fff"
                />
              </g>
            )}

            {/* Labels dos eixos */}
            <text
              x="200"
              y="390"
              textAnchor="middle"
              className="text-sm font-medium fill-gray-600"
            >
              Danceability →
            </text>
            <text
              x="15"
              y="200"
              textAnchor="middle"
              className="text-sm font-medium fill-gray-600"
              transform="rotate(-90 15 200)"
            >
              ← Acousticness
            </text>
          </svg>
        </div>

        {/* Informações do ponto selecionado */}
        {selectedPoint && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">
              Mood Selecionado
            </h4>
            <p className="text-sm text-purple-700">
              {getQuadrantLabel(selectedPoint.x, selectedPoint.y)}
            </p>
            <div className="mt-2 flex gap-4 text-xs text-purple-600">
              <span>Danceability: {Math.round(selectedPoint.x * 100)}%</span>
              <span>Acousticness: {Math.round(selectedPoint.y * 100)}%</span>
            </div>
          </div>
        )}

        {/* Informações de hover */}
        {isHovering && hoverPoint && !selectedPoint && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              {getQuadrantLabel(hoverPoint.x, hoverPoint.y)}
            </p>
          </div>
        )}

        {/* Legenda */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Acústico: Instrumentos orgânicos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Energético: Som eletrônico/intenso</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Calmo: Ritmo relaxante</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Dançante: Ritmo animado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
