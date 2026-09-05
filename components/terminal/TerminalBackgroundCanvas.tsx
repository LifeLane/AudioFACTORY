import React, { useEffect, useRef } from 'react';
import { useTerminal } from './TerminalContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

const GOOGLE_COLORS = [
  '#4285F4', // Google Blue
  '#EA4335', // Google Red
  '#FBBC04', // Google Yellow
  '#34A853'  // Google Green
];

export const TerminalBackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isAudioActive, scanlinesEnabled } = useTerminal();
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Initialize Google particles
    const particleCount = Math.min(32, Math.floor((width * height) / 30000));
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.2,
        color: GOOGLE_COLORS[i % GOOGLE_COLORS.length],
        alpha: Math.random() * 0.4 + 0.3
      });
    }

    let scanlineY = 0;
    let wavePhase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Deep OLED Terminal Gradient
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 100,
        width / 2, height / 2, Math.max(width, height)
      );
      grad.addColorStop(0, '#0D1117');
      grad.addColorStop(0.7, '#080B10');
      grad.addColorStop(1, '#040608');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. High-Tech Matrix Grid with Subtle Google Color Accents
      const gridSize = 36;
      ctx.strokeStyle = 'rgba(48, 54, 61, 0.25)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Grid Intersection Crosshairs (Selected Nodes in Google Colors)
      const step = gridSize * 3;
      for (let x = step; x < width; x += step) {
        for (let y = step; y < height; y += step) {
          const colorIdx = ((x + y) / step) % 4;
          ctx.fillStyle = GOOGLE_COLORS[colorIdx] + '25'; // 15% opacity
          ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
      }

      // 3. Mouse Radial Beacon
      if (mouseRef.current.active) {
        const radGlow = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 220
        );
        radGlow.addColorStop(0, 'rgba(66, 133, 244, 0.08)');
        radGlow.addColorStop(0.5, 'rgba(52, 168, 83, 0.03)');
        radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 4. Audio-Reactive Oscilloscope Beam (Active during speech playback)
      wavePhase += 0.04;
      if (isAudioActive) {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;

        // Wave 1: Google Green Live Beam
        ctx.strokeStyle = '#34A853';
        ctx.shadowColor = '#34A853';
        ctx.beginPath();
        const midY = height * 0.88;
        for (let x = 0; x < width; x += 4) {
          const freq1 = Math.sin(x * 0.015 + wavePhase * 2);
          const freq2 = Math.cos(x * 0.03 - wavePhase);
          const y = midY + (freq1 * 22 + freq2 * 14);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Wave 2: Google Blue Harmonics
        ctx.strokeStyle = '#4285F4';
        ctx.shadowColor = '#4285F4';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = 0; x < width; x += 4) {
          const freq = Math.sin(x * 0.025 + wavePhase * 3);
          const y = midY + freq * 12;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 5. Google Constellation Particle Mesh
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Screen wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby particles with subtle color lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 110) * 0.18;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // 6. Electron Beam CRT Scan Sweep Line
      scanlineY = (scanlineY + 1.2) % (height + 200);
      const beamGrad = ctx.createLinearGradient(0, scanlineY - 40, 0, scanlineY);
      beamGrad.addColorStop(0, 'rgba(66, 133, 244, 0)');
      beamGrad.addColorStop(0.5, 'rgba(66, 133, 244, 0.03)');
      beamGrad.addColorStop(1, 'rgba(66, 133, 244, 0.08)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, scanlineY - 40, width, 40);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAudioActive]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Optional CRT Scanlines Layer */}
      {scanlinesEnabled && (
        <div className="absolute inset-0 crt-scanlines opacity-40 pointer-events-none" />
      )}
    </div>
  );
};
