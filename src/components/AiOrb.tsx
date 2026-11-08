import React, { useEffect, useRef } from 'react';
import { AssistantState } from '../types';

interface AiOrbProps {
  state: AssistantState;
  size?: number;
  onClick?: () => void;
  audioLevel?: number; // 0 to 1
}

export const AiOrb: React.FC<AiOrbProps> = ({
  state,
  size = 220,
  onClick,
  audioLevel = 0.3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Canvas coordinate space
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = size * 0.3;

      // Dynamic color palette based on state
      let primaryColor = 'rgba(168, 85, 247, '; // purple
      let secondaryColor = 'rgba(59, 130, 246, '; // blue
      let coreGlow = 'rgba(236, 72, 153, '; // pink/magenta

      let pulse = Math.sin(time * 2) * 4;
      let particleSpeed = 1;
      let waveCount = 3;

      if (state === 'listening') {
        primaryColor = 'rgba(6, 182, 212, '; // cyan
        secondaryColor = 'rgba(59, 130, 246, '; // blue
        coreGlow = 'rgba(16, 185, 129, '; // emerald
        pulse = Math.sin(time * 6) * 10 * (0.8 + audioLevel * 1.5);
        particleSpeed = 2.2;
        waveCount = 4;
      } else if (state === 'thinking') {
        primaryColor = 'rgba(236, 72, 153, '; // pink
        secondaryColor = 'rgba(168, 85, 247, '; // purple
        coreGlow = 'rgba(245, 158, 11, '; // amber
        pulse = Math.sin(time * 4) * 6;
        particleSpeed = 3.5;
        waveCount = 5;
      } else if (state === 'speaking') {
        primaryColor = 'rgba(192, 132, 252, '; // lavender
        secondaryColor = 'rgba(236, 72, 153, '; // magenta
        coreGlow = 'rgba(56, 189, 248, '; // sky
        pulse = Math.sin(time * 8) * (8 + audioLevel * 20);
        particleSpeed = 2.8;
        waveCount = 6;
      }

      const currentRadius = Math.max(10, baseRadius + pulse);

      // 1. Outer ambient glow ring
      const ambientGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.5,
        centerX,
        centerY,
        baseRadius * 2.2
      );
      ambientGrad.addColorStop(0, primaryColor + '0.4)');
      ambientGrad.addColorStop(0.5, secondaryColor + '0.15)');
      ambientGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. Multi-layered orbital soundwaves / resonance rings
      for (let i = 0; i < waveCount; i++) {
        const angleOffset = (time * particleSpeed * (i % 2 === 0 ? 1 : -1) + (i * Math.PI) / 3);
        const waveRadius = currentRadius + (i + 1) * 8 + Math.sin(time * 3 + i) * 5;

        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.1) {
          const distortion = Math.sin(a * 4 + angleOffset) * (4 + i * 2);
          const r = waveRadius + distortion;
          const x = centerX + Math.cos(a) * r;
          const y = centerY + Math.sin(a) * r;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = (i % 2 === 0 ? primaryColor : secondaryColor) + `${0.35 - i * 0.05})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 3. Central glowing plasma orb
      const orbGrad = ctx.createRadialGradient(
        centerX - currentRadius * 0.3,
        centerY - currentRadius * 0.3,
        currentRadius * 0.1,
        centerX,
        centerY,
        currentRadius
      );
      orbGrad.addColorStop(0, '#ffffff');
      orbGrad.addColorStop(0.2, coreGlow + '0.95)');
      orbGrad.addColorStop(0.6, primaryColor + '0.85)');
      orbGrad.addColorStop(0.9, secondaryColor + '0.7)');
      orbGrad.addColorStop(1, 'rgba(10, 8, 24, 0.9)');

      ctx.save();
      ctx.shadowColor = primaryColor + '0.9)';
      ctx.shadowBlur = 25;

      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Floating neural sparkles inside core
      for (let p = 0; p < 8; p++) {
        const sparkAngle = time * 1.5 + p * (Math.PI / 4);
        const sparkDist = (currentRadius * 0.55) * Math.sin(time * 2 + p);
        const px = centerX + Math.cos(sparkAngle) * sparkDist;
        const py = centerY + Math.sin(sparkAngle) * sparkDist;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, size, audioLevel]);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Mayuri AI Orb (${state} state)`}
      className="relative flex items-center justify-center cursor-pointer select-none group focus:outline-none"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="transition-transform duration-300 group-hover:scale-105 active:scale-95"
      />
      {/* Center status icon hint */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {state === 'listening' && (
          <span className="text-[11px] font-semibold text-cyan-200 tracking-wider uppercase bg-cyan-950/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-cyan-400/30">
            Sun Rahi Hoon
          </span>
        )}
        {state === 'thinking' && (
          <span className="text-[11px] font-semibold text-purple-200 tracking-wider uppercase bg-purple-950/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-purple-400/30">
            Soch Rahi Hoon
          </span>
        )}
        {state === 'speaking' && (
          <span className="text-[11px] font-semibold text-pink-200 tracking-wider uppercase bg-pink-950/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-pink-400/30 animate-pulse">
            Bol Rahi Hoon
          </span>
        )}
      </div>
    </div>
  );
};
