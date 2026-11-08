import React, { useEffect, useState } from 'react';
import { AssistantState } from '../types';

interface WaveformProps {
  state: AssistantState;
  barCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformProps> = ({ state, barCount = 28 }) => {
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => 15)
  );

  useEffect(() => {
    let interval: any;

    if (state === 'listening') {
      interval = setInterval(() => {
        setHeights(
          Array.from({ length: barCount }, (_, i) => {
            const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
            const factor = Math.max(0.2, 1 - centerDist * 0.7);
            return Math.floor(Math.random() * 55 * factor + 15);
          })
        );
      }, 70);
    } else if (state === 'speaking') {
      interval = setInterval(() => {
        setHeights(
          Array.from({ length: barCount }, (_, i) => {
            const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
            const factor = Math.max(0.3, 1 - centerDist * 0.5);
            return Math.floor(Math.sin(Date.now() / 150 + i * 0.4) * 25 * factor + 40);
          })
        );
      }, 50);
    } else if (state === 'thinking') {
      interval = setInterval(() => {
        setHeights(
          Array.from({ length: barCount }, (_, i) => {
            return Math.floor(Math.sin(Date.now() / 200 + i * 0.6) * 15 + 20);
          })
        );
      }, 90);
    } else {
      // Idle gentle undulating ripple
      interval = setInterval(() => {
        setHeights(
          Array.from({ length: barCount }, (_, i) => {
            return Math.floor(Math.sin(Date.now() / 600 + i * 0.3) * 6 + 10);
          })
        );
      }, 120);
    }

    return () => clearInterval(interval);
  }, [state, barCount]);

  // Color gradient according to state
  const getBarColor = (index: number) => {
    if (state === 'listening') {
      return 'bg-gradient-to-t from-cyan-600 via-teal-400 to-emerald-300';
    }
    if (state === 'thinking') {
      return 'bg-gradient-to-t from-purple-600 via-pink-500 to-amber-400';
    }
    if (state === 'speaking') {
      return 'bg-gradient-to-t from-violet-600 via-fuchsia-400 to-pink-300';
    }
    return 'bg-gradient-to-t from-slate-700 via-purple-900 to-indigo-600/40';
  };

  return (
    <div className="flex items-center justify-center gap-[3px] h-16 w-full max-w-sm px-4">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}%` }}
          className={`w-1 rounded-full transition-all duration-75 ease-out ${getBarColor(i)} shadow-sm`}
        />
      ))}
    </div>
  );
};
