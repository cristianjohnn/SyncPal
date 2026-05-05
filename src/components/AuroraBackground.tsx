"use client";

import { useEffect, useRef } from "react";

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      updateWaveLayers();
    };

    const colors = [
      { r: 0, g: 255, b: 170 }, // teal
      { r: 0, g: 229, b: 255 }, // cyan
      { r: 124, g: 58, b: 237 }, // purple
      { r: 59, g: 7, b: 100 },  // deep purple
    ];

    let waveLayers: any[] = [];
    
    const updateWaveLayers = () => {
      waveLayers = [
        { amplitude: canvas.height * 0.15, frequency: 0.0015, speed: 0.0003, yOffset: canvas.height * 0.3, color: colors[3] },
        { amplitude: canvas.height * 0.2, frequency: 0.001, speed: 0.0004, yOffset: canvas.height * 0.5, color: colors[2] },
        { amplitude: canvas.height * 0.1, frequency: 0.002, speed: 0.0005, yOffset: canvas.height * 0.7, color: colors[1] },
        { amplitude: canvas.height * 0.12, frequency: 0.0018, speed: 0.0006, yOffset: canvas.height * 0.8, color: colors[0] },
      ];
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const baseColor = "#020818";

    const numParticles = 30;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.1,
      speedY: (Math.random() - 0.5) * 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const numFragments = 12;
    const fragments = Array.from({ length: numFragments }, () => ({
      x: Math.random() * (window.innerWidth * 0.6),
      y: Math.random() * window.innerHeight,
      size: Math.random() * 40 + 10,
      angle: Math.random() * Math.PI * 2,
      speed: (Math.random() - 0.5) * 0.005,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.02 + 0.005,
    }));

    const drawWaves = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;

      waveLayers.forEach((layer) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        for (let x = 0; x <= width; x += 15) {
          const asymmetryFactor = 1 - Math.pow(x / width, 1.5);
          const y = layer.yOffset + 
                    Math.sin(x * layer.frequency + time * layer.speed) * layer.amplitude * asymmetryFactor +
                    Math.cos(x * layer.frequency * 0.5 - time * layer.speed * 0.8) * (layer.amplitude * 0.5) * asymmetryFactor;
          
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, 0.12)`);
        gradient.addColorStop(0.3, `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, 0.08)`);
        gradient.addColorStop(1, `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, 0.0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const asymmetryFactor = 1 - Math.pow(x / width, 1.5);
          const y = layer.yOffset + 
                    Math.sin(x * layer.frequency + time * layer.speed) * layer.amplitude * asymmetryFactor +
                    Math.cos(x * layer.frequency * 0.5 - time * layer.speed * 0.8) * (layer.amplitude * 0.5) * asymmetryFactor;
          
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
        lineGradient.addColorStop(0, `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, 0.2)`);
        lineGradient.addColorStop(0.4, `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, 0.05)`);
        lineGradient.addColorStop(1, `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, 0.0)`);
        
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    const drawParticles = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;

      particles.forEach(p => {
        const waveInfluenceX = Math.sin(p.y * 0.005 + time * 0.0005) * 0.3;
        const waveInfluenceY = Math.cos(p.x * 0.005 + time * 0.0005) * 0.3;

        p.x += p.speedX + waveInfluenceX;
        p.y += p.speedY + waveInfluenceY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const asymmetryFactor = Math.max(0, 1 - (p.x / width) * 1.2);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity * asymmetryFactor})`;
        
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${0.5 * asymmetryFactor})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    const drawFragments = (time: number) => {
      const width = canvas.width;
      
      fragments.forEach(f => {
        f.angle += f.speed;
        f.x += Math.sin(time * 0.0002 + f.angle) * 0.1;
        f.y += Math.cos(time * 0.0002 + f.angle) * 0.1;

        const asymmetryFactor = Math.max(0, 1 - (f.x / width));
        if (asymmetryFactor <= 0) return;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle);
        
        ctx.beginPath();
        ctx.moveTo(-f.size/2, -f.size/2);
        ctx.lineTo(f.size/2, -f.size/2 + Math.sin(time * 0.001)*3);
        ctx.lineTo(f.size/2, f.size/2);
        ctx.lineTo(-f.size/2 + Math.cos(time * 0.001)*3, f.size/2);
        ctx.closePath();

        ctx.fillStyle = `rgba(${f.color.r}, ${f.color.g}, ${f.color.b}, ${f.opacity * asymmetryFactor})`;
        ctx.fill();
        ctx.restore();
      });
    };

    const render = (currentTime: number) => {
      time = currentTime;
      
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const lightGradient = ctx.createRadialGradient(
        0, canvas.height * 0.5, 0,
        0, canvas.height * 0.5, canvas.width * 0.8
      );
      lightGradient.addColorStop(0, "rgba(59, 7, 100, 0.3)");
      lightGradient.addColorStop(0.4, "rgba(2, 8, 24, 0.05)");
      lightGradient.addColorStop(1, "rgba(2, 8, 24, 0)");
      
      ctx.fillStyle = lightGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawFragments(time);
      drawWaves(time);
      drawParticles(time);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-10] pointer-events-none"
    />
  );
}
