import React from 'react';
import { CIRCLE_OF_FIFTHS } from '../core/harmony-engine';

interface CircleOfFifthsProps {
  currentKey: string;
  onSelectKey: (key: string) => void;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ currentKey, onSelectKey }) => {
  const radius = 120;
  const center = 150;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl backdrop-blur shadow-2xl">
      <div className="text-xs font-mono uppercase text-zinc-400 mb-3 tracking-wider">
        Círculo de Quintas Interativo
      </div>

      <svg width={300} height={300} className="select-none">
        {/* Outer and Inner circles */}
        <circle cx={center} cy={center} r={radius + 15} fill="none" stroke="#27272a" strokeWidth="2" />
        <circle cx={center} cy={center} r={radius - 25} fill="none" stroke="#27272a" strokeWidth="1.5" strokeDasharray="3,3" />

        {CIRCLE_OF_FIFTHS.map((item, index) => {
          // Angle in radians (index 0 at top = -pi/2)
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const outerX = center + radius * Math.cos(angle);
          const outerY = center + radius * Math.sin(angle);

          const innerRadius = radius - 45;
          const innerX = center + innerRadius * Math.cos(angle);
          const innerY = center + innerRadius * Math.sin(angle);

          const isSelected = item.major === currentKey;

          return (
            <g key={item.major} className="cursor-pointer group" onClick={() => onSelectKey(item.major)}>
              {/* Outer Major Node */}
              <circle
                cx={outerX}
                cy={outerY}
                r={19}
                className={`transition-all duration-200 ${
                  isSelected
                    ? 'fill-emerald-500 stroke-emerald-300 stroke-2 shadow-lg'
                    : 'fill-zinc-900 stroke-zinc-700 group-hover:fill-zinc-800 group-hover:stroke-emerald-500'
                }`}
              />
              <text
                x={outerX}
                y={outerY + 4}
                textAnchor="middle"
                className={`font-mono text-xs font-bold pointer-events-none ${
                  isSelected ? 'fill-zinc-950 font-black' : 'fill-zinc-100 group-hover:fill-emerald-400'
                }`}
              >
                {item.major}
              </text>

              {/* Inner Minor Relative */}
              <text
                x={innerX}
                y={innerY + 3}
                textAnchor="middle"
                className={`font-mono text-[10px] pointer-events-none transition-colors ${
                  isSelected ? 'fill-emerald-400 font-bold' : 'fill-zinc-500 group-hover:fill-zinc-300'
                }`}
              >
                {item.minor}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
