
import React, { useRef, useEffect, useCallback } from 'react';
import { VFXType, Particle, AppSettings } from '../types';
import { soundEngine } from '../services/SoundEngine';

interface VFXCanvasProps {
  settings: AppSettings;
  onCanvasRef: (canvas: HTMLCanvasElement | null) => void;
}

const VFXCanvas: React.FC<VFXCanvasProps> = ({ settings, onCanvasRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const touchPointsRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const fpsRef = useRef<number>(60);
  
  // Motion Detection Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const motionPointRef = useRef<{ x: number, y: number } | null>(null);
  
  const autoCursorRef = useRef({ 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, 
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 500, 
    vx: 5, 
    vy: 3 
  });

  useEffect(() => {
    onCanvasRef(canvasRef.current);
  }, [onCanvasRef]);

  useEffect(() => {
    soundEngine.init();
  }, []);

  useEffect(() => {
     if (settings.isMuted) soundEngine.setVolume(0);
     else soundEngine.setVolume(settings.soundVolume);
  }, [settings.isMuted, settings.soundVolume]);

  // --- CAMERA & MOTION SETUP ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120 } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error("Camera access failed:", err);
        }
    };

    if (settings.isMotionControl) {
        if (!videoRef.current) {
            const v = document.createElement('video');
            v.style.display = 'none';
            v.autoplay = true;
            v.playsInline = true;
            videoRef.current = v;
            document.body.appendChild(v);
        }
        if (!motionCanvasRef.current) {
            const c = document.createElement('canvas');
            c.width = 160; 
            c.height = 120;
            c.style.display = 'none';
            motionCanvasRef.current = c;
        }
        startCamera();
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            const s = videoRef.current.srcObject as MediaStream;
            s.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        motionPointRef.current = null;
    }

    return () => {
        if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [settings.isMotionControl]);


  const createParticles = (x: number, y: number, count: number, type: VFXType) => {
    const newParticles: Particle[] = [];
    const baseHue = Date.now() / 20 % 360; 

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1; 
      
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed;
      let life = 1.0;
      let size = Math.random() * 3 + 1;
      let color = `hsla(${baseHue}, 100%, 50%, 1)`;
      
      let rotation = Math.random() * 360;
      let rotationSpeed = (Math.random() - 0.5) * 10;
      let char = '';

      switch (type) {
        case VFXType.QUANTUM_FLUX:
           vx *= 4; vy *= 4;
           color = Math.random() > 0.5 ? '#0ff' : '#f0f';
           size = Math.random() * 4 + 2; life = 0.6; break;
        case VFXType.GOLDEN_AURORA:
           vx *= 0.5; vy *= 0.5;
           color = `hsla(${45 + Math.random() * 10}, 100%, ${50 + Math.random() * 20}%, 0.8)`;
           size = Math.random() * 5 + 2; life = 2.0; break;
        case VFXType.PRISM_RAYS:
           vx *= 5; vy *= 5;
           color = `hsla(${Math.random() * 360}, 100%, 70%, 1)`;
           size = Math.random() * 20 + 5; rotationSpeed = (Math.random() - 0.5) * 40; life = 0.7; break;
        case VFXType.COSMIC_NOVA:
           vx *= 0.8; vy *= 0.8;
           color = `hsla(${240 + Math.random() * 60}, 90%, 60%, 0.5)`;
           size = Math.random() * 10 + 5; life = 2.0; break;
        case VFXType.NEON_SPARK:
          vx *= 2.5; vy *= 2.5;
          color = `hsla(${Math.random() * 40 + 170}, 100%, 60%, 1)`; 
          life = Math.random() * 0.6 + 0.4; size = Math.random() * 3 + 1; break;
        case VFXType.FIRE_TRAIL:
          vx = (Math.random() - 0.5) * 1.5; vy = (Math.random() - 1) * 4 - 1; 
          color = `hsla(${Math.random() * 30 + 10}, 100%, 50%,`; 
          size = Math.random() * 20 + 8; life = Math.random() * 0.8 + 0.5; break;
        case VFXType.CYBER_GRID:
           vx *= 0.5; vy *= 0.5;
           color = `hsla(120, 100%, 50%, 1)`; size = Math.random() * 2 + 1; break;
        case VFXType.PARTICLE_STORM:
            vx += (Math.random() - 0.5) * 5; vy += (Math.random() - 0.5) * 5;
            color = `hsla(${baseHue + 20}, 90%, 60%, 0.9)`; size = Math.random() * 4 + 1; break;
        case VFXType.PLASMA_WAVE:
            vx *= 0.2; vy *= 0.2;
            size = Math.random() * 30 + 10; color = `hsla(${baseHue}, 80%, 60%, 0.4)`; break;
        case VFXType.VORTEX_SPIRAL:
            const spiralSpeed = speed * 2;
            vx = Math.cos(angle + Math.PI / 2) * spiralSpeed; vy = Math.sin(angle + Math.PI / 2) * spiralSpeed;
            color = `hsla(${Math.random() * 60 + 260}, 90%, 70%, 1)`; 
            size = Math.random() * 2 + 0.5; life = 1.5; break;
        case VFXType.DATA_STREAM:
            vx = 0; vy = Math.random() * 8 + 5; 
            color = '#0f0'; size = Math.random() * 10 + 10; life = 1.0;
            char = Math.random() > 0.5 ? '1' : '0'; break;
        case VFXType.GALAXY_SWIRL:
             vx *= 0.1; vy *= 0.1;
             color = `hsla(${Math.random() * 100 + 220}, 80%, 60%, 0.8)`;
             size = Math.random() * 4 + 1; life = 2.0; break;
        case VFXType.CRYSTAL_SHARD:
             vx *= 3; vy *= 3;
             color = `hsla(200, 80%, 90%`; size = Math.random() * 8 + 2;
             rotationSpeed = (Math.random() - 0.5) * 20; life = 0.8; break;
        case VFXType.BLOOD_MOON:
             vx = (Math.random() - 0.5) * 2; vy = (Math.random() * -1.5) - 1; 
             color = `hsla(${Math.random() * 10 + 350}, 100%, 45%, 0.8)`; 
             size = Math.random() * 12 + 6; life = 2.0; break;
        case VFXType.SILK_ART:
             vx *= 0.5; vy *= 0.5;
             const rainbowHue = (baseHue + i * 15) % 360;
             color = `hsla(${rainbowHue}, 100%, 50%, 0.8)`;
             size = Math.random() * 2 + 1; life = 2.5; break;
      }

      newParticles.push({
        x, y, vx, vy, life, maxLife: life, size, color, type,
        history: [], rotation, rotationSpeed, char
      });
    }
    particlesRef.current.push(...newParticles);
  };

  // --- ZEN CLOCK (PEACEFUL LOOK) ---
  const drawZenClock = (ctx: CanvasRenderingContext2D, width: number, height: number, timeMs: number) => {
    const cx = width / 2;
    const cy = height / 2;
    const date = new Date();
    const radius = Math.min(width, height) * 0.18; // Slightly smaller for elegance

    // --- 1. Soft Backdrop (Breathing) ---
    const breath = Math.sin(timeMs * 0.001) * 0.05 + 1;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.1 * breath, 0, Math.PI * 2);
    // Gradient fill for depth
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.5);
    grad.addColorStop(0, 'rgba(10, 20, 40, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // --- 2. Elegant Time Ring ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- 3. Seconds Trail (Smooth Arc) ---
    const secs = date.getSeconds();
    const ms = date.getMilliseconds();
    const smoothSec = secs + ms / 1000;
    const angle = (smoothSec / 60) * Math.PI * 2 - Math.PI / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI/2, angle);
    ctx.strokeStyle = 'rgba(100, 255, 255, 0.6)'; // Soft Cyan
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Tip of the seconds hand
    const tipX = cx + Math.cos(angle) * radius;
    const tipY = cy + Math.sin(angle) * radius;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'cyan';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset for performance
    ctx.restore();

    // --- 4. Text Display (Minimalist) ---
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Time
    ctx.font = `300 ${radius * 0.5}px "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText(`${hours}:${mins}`, cx, cy - radius * 0.1);
    
    // Date
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
    ctx.font = `200 ${radius * 0.15}px "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText(dateStr.toUpperCase(), cx, cy + radius * 0.35);
    ctx.restore();
  };

  const detectMotion = (canvasWidth: number, canvasHeight: number) => {
      const video = videoRef.current;
      const motionCanvas = motionCanvasRef.current;
      if (!video || !motionCanvas || video.readyState !== 4) return;
      
      const ctx = motionCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      const w = motionCanvas.width;
      const h = motionCanvas.height;
      ctx.drawImage(video, 0, 0, w, h);
      
      const frame = ctx.getImageData(0, 0, w, h);
      const data = frame.data;
      const len = data.length;
      
      let sumX = 0;
      let sumY = 0;
      let count = 0;
      const threshold = 30; 
      
      if (prevFrameDataRef.current) {
          const prev = prevFrameDataRef.current;
          for (let i = 0; i < len; i += 16) { 
              const diff = Math.abs(data[i] - prev[i]) + Math.abs(data[i+1] - prev[i+1]) + Math.abs(data[i+2] - prev[i+2]);
              if (diff > threshold) {
                  const pixelIndex = i / 4;
                  const x = pixelIndex % w;
                  const y = Math.floor(pixelIndex / w);
                  sumX += x; sumY += y; count++;
              }
          }
      }
      
      prevFrameDataRef.current = new Uint8ClampedArray(data);
      
      if (count > 20) {
          const avgX = sumX / count;
          const avgY = sumY / count;
          const screenX = canvasWidth - (avgX / w) * canvasWidth;
          const screenY = (avgY / h) * canvasHeight;
          
          if (motionPointRef.current) {
              const prevPoint = motionPointRef.current;
              motionPointRef.current = {
                  x: prevPoint.x * 0.8 + screenX * 0.2,
                  y: prevPoint.y * 0.8 + screenY * 0.2
              };
          } else {
              motionPointRef.current = { x: screenX, y: screenY };
          }
      }
  };

  const render = useCallback((time: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const deltaTime = Math.min((time - lastTimeRef.current) / 1000, 0.1);
    const currentFps = 1 / deltaTime;
    fpsRef.current = fpsRef.current * 0.9 + currentFps * 0.1;
    lastTimeRef.current = time;

    if (settings.isMotionControl) {
        detectMotion(canvas.width, canvas.height);
        if (motionPointRef.current) {
            const mp = motionPointRef.current;
            createParticles(mp.x, mp.y, Math.ceil(settings.particleCount / 2), settings.vfxType);
        }
    }

    ctx.globalCompositeOperation = 'source-over';
    
    let fadeAlpha = 0.15;
    if (settings.vfxType === VFXType.FIRE_TRAIL) fadeAlpha = 0.25;
    if (settings.vfxType === VFXType.CRYSTAL_SHARD) fadeAlpha = 0.2; 
    if (settings.vfxType === VFXType.BLOOD_MOON) fadeAlpha = 0.08; 
    if (settings.vfxType === VFXType.DATA_STREAM) fadeAlpha = 0.1; 
    if (settings.vfxType === VFXType.SILK_ART) fadeAlpha = 0.05;
    if (settings.vfxType === VFXType.GOLDEN_AURORA) fadeAlpha = 0.08;
    if (settings.vfxType === VFXType.COSMIC_NOVA) fadeAlpha = 0.1;

    ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ZEN CLOCK if enabled
    if (settings.showClock) {
       drawZenClock(ctx, canvas.width, canvas.height, time);
    }

    ctx.globalCompositeOperation = 'lighter';
    const bloomScale = settings.bloomIntensity;

    touchPointsRef.current.forEach((point) => {
      createParticles(point.x, point.y, Math.ceil(settings.particleCount / 5), settings.vfxType);
    });

    if (settings.isAutoPlay && !settings.isMotionControl) {
       const cursor = autoCursorRef.current;
       const centerX = canvas.width / 2;
       const centerY = canvas.height / 2;

       cursor.x += cursor.vx;
       cursor.y += cursor.vy;

       const safeZoneX = canvas.width * 0.35; 
       const safeZoneY = canvas.height * 0.35;

       if (cursor.x > centerX + safeZoneX) cursor.vx -= 0.5; 
       else if (cursor.x < centerX - safeZoneX) cursor.vx += 0.5; 
       else {
          cursor.vx += (Math.random() - 0.5) * 0.5;
          cursor.vy += (Math.random() - 0.5) * 0.5;
       }

       if (cursor.y > centerY + safeZoneY) cursor.vy -= 0.5;
       if (cursor.y < centerY - safeZoneY) cursor.vy += 0.5;

       const speed = Math.sqrt(cursor.vx * cursor.vx + cursor.vy * cursor.vy);
       const maxSpeed = 15;
       if (speed > maxSpeed) {
         cursor.vx = (cursor.vx / speed) * maxSpeed;
         cursor.vy = (cursor.vy / speed) * maxSpeed;
       }
       
       createParticles(cursor.x, cursor.y, Math.ceil(settings.particleCount / 3), settings.vfxType);
    }

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.vx += settings.wind * 0.1; 
      if (settings.turbulence > 0) {
          p.vx += (Math.random() - 0.5) * settings.turbulence * 0.2;
          p.vy += (Math.random() - 0.5) * settings.turbulence * 0.2;
      }

      if (p.type === VFXType.FIRE_TRAIL) {
          p.vy -= 0.15; p.x += (Math.random() - 0.5) * 2; p.size *= 0.96;
      } else if (p.type === VFXType.VORTEX_SPIRAL) {
          p.vx -= p.vx * 0.02; p.vy -= p.vy * 0.02; p.rotation! += 5;
      } else if (p.type === VFXType.GALAXY_SWIRL || p.type === VFXType.COSMIC_NOVA) {
          const dx = p.x - (canvas.width / 2);
          const dy = p.y - (canvas.height / 2);
          const dist = Math.sqrt(dx*dx + dy*dy);
          const force = 1000 / (dist * dist + 100);
          p.vx -= dx * force * 0.01; p.vy -= dy * force * 0.01;
      } else if (p.type === VFXType.SILK_ART || p.type === VFXType.GOLDEN_AURORA) {
          p.vx *= 0.96; p.vy *= 0.96;
          p.vx += Math.sin(p.y * 0.01 + time * 0.002) * 0.2;
          p.vy += Math.cos(p.x * 0.01 + time * 0.002) * 0.2;
      } else if (p.type === VFXType.QUANTUM_FLUX) {
          if (Math.random() > 0.9) {
             p.x += (Math.random() - 0.5) * 10; p.y += (Math.random() - 0.5) * 10;
          }
          p.vx *= 0.9; p.vy *= 0.9;
      }

      if (p.type !== VFXType.DATA_STREAM && p.type !== VFXType.GALAXY_SWIRL && p.type !== VFXType.SILK_ART && p.type !== VFXType.GOLDEN_AURORA && p.type !== VFXType.COSMIC_NOVA) {
          p.vy += settings.gravity; 
          p.vx *= settings.friction; p.vy *= settings.friction;
      } else if (p.type === VFXType.DATA_STREAM) {
         p.vy += settings.gravity * 0.5;
      }

      p.x += p.vx; p.y += p.vy;
      p.life -= deltaTime;
      if (p.rotationSpeed) p.rotation = (p.rotation || 0) + p.rotationSpeed;

      let trailLength = 0;
      if (p.type === VFXType.VORTEX_SPIRAL) trailLength = 15;
      if (p.type === VFXType.BLOOD_MOON) trailLength = 20;
      if (p.type === VFXType.NEON_SPARK) trailLength = 5;
      if (p.type === VFXType.SILK_ART) trailLength = 25; 
      if (p.type === VFXType.GOLDEN_AURORA) trailLength = 30;

      if (trailLength > 0) {
        if (!p.history) p.history = [];
        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > trailLength) p.history.shift();
      }

      if (p.life <= 0 || p.size < 0.2) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      const alpha = p.life / p.maxLife;
      
      if (p.type === VFXType.QUANTUM_FLUX) {
         ctx.fillStyle = p.color; ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
         if (bloomScale > 0.5) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`; ctx.fillRect(p.x - p.size + 4, p.y - p.size + 4, p.size, p.size);
         }
      } else if (p.type === VFXType.GOLDEN_AURORA) {
         if (p.history && p.history.length > 2) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = Math.max(1, p.size * alpha * (1 + bloomScale * 0.5));
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(p.history[0].x, p.history[0].y);
            for (let j = 1; j < p.history.length; j++) {
               const p1 = p.history[j-1]; const p2 = p.history[j];
               const midX = (p1.x + p2.x) / 2; const midY = (p1.y + p2.y) / 2;
               ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
            }
            ctx.lineTo(p.x, p.y); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2); ctx.fill();
         }
      } else if (p.type === VFXType.PRISM_RAYS) {
         ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rotation || 0) * Math.PI / 180);
         ctx.fillStyle = p.color; ctx.globalAlpha = alpha;
         ctx.fillRect(-p.size/4, -p.size, p.size/2, p.size * 2);
         ctx.fillRect(-p.size, -p.size/4, p.size * 2, p.size/2); ctx.restore();
      } else if (p.type === VFXType.COSMIC_NOVA) {
         ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (2 + bloomScale), 0, Math.PI * 2); ctx.fill();
         ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === VFXType.FIRE_TRAIL) {
        if (bloomScale > 0.1) {
             ctx.fillStyle = p.color + ` ${alpha * 0.3 * bloomScale})`;
             ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 + bloomScale * 0.5), 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = `${p.color} ${alpha})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === VFXType.DATA_STREAM) {
        ctx.font = `${p.size}px monospace`;
        if (bloomScale > 1.0) {
            ctx.fillStyle = `rgba(0, 255, 65, ${alpha * 0.3 * bloomScale})`; ctx.fillText(p.char || '1', p.x, p.y);
        }
        ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
        const charToDraw = Math.random() > 0.95 ? (Math.random() > 0.5 ? '1' : '0') : p.char;
        ctx.fillText(charToDraw || '1', p.x, p.y);
      } else if (p.type === VFXType.CRYSTAL_SHARD) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rotation || 0) * Math.PI / 180);
        if (bloomScale > 0.5) {
             ctx.fillStyle = `${p.color}, ${alpha * 0.4 * bloomScale})`;
             const s = p.size * (1 + bloomScale * 0.3);
             ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.6, 0); ctx.lineTo(0, s); ctx.lineTo(-s * 0.6, 0); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = `${p.color}, ${alpha})`;
        ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.6, 0); ctx.lineTo(0, p.size); ctx.lineTo(-p.size * 0.6, 0); ctx.closePath(); ctx.fill();
        ctx.restore();
      } else if (p.type === VFXType.SILK_ART) {
         if (p.history && p.history.length > 2) {
            ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(0.5, p.size * alpha);
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(p.history[0].x, p.history[0].y);
            for (let j = 1; j < p.history.length; j++) {
               const p1 = p.history[j-1]; const p2 = p.history[j];
               const midX = (p1.x + p2.x) / 2; const midY = (p1.y + p2.y) / 2;
               ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
            }
            ctx.lineTo(p.x, p.y); ctx.stroke();
         }
      } else if (p.type === VFXType.NEON_SPARK) {
         const flareScale = 1 + bloomScale;
         ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.5 * flareScale, 0, Math.PI * 2); ctx.fill();
         ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`;
         const flareSize = p.size * 2 * flareScale; const thickness = Math.max(1, p.size * 0.15);
         ctx.fillRect(p.x - flareSize, p.y - thickness/2, flareSize * 2, thickness);
         ctx.fillRect(p.x - thickness/2, p.y - flareSize, thickness, flareSize * 2);
      } else {
        if (bloomScale > 0.1) {
            ctx.fillStyle = p.color; ctx.globalAlpha = alpha * 0.25 * bloomScale;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 + bloomScale), 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = p.color; ctx.globalAlpha = alpha;
        if (p.history && p.history.length > 1) {
            ctx.strokeStyle = p.color; ctx.lineWidth = p.size * 0.5; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(p.history[0].x, p.history[0].y);
            for (const h of p.history) ctx.lineTo(h.x, h.y);
            ctx.lineTo(p.x, p.y); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, [settings.vfxType, settings.particleCount, settings.isAutoPlay, settings.isMotionControl, settings.isMuted, settings.soundVolume, settings.bloomIntensity, settings.showClock, settings.wind, settings.turbulence]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [render]);

  const handlePointerDown = (e: React.PointerEvent) => {
    soundEngine.startBackgroundMusic();
    canvasRef.current?.setPointerCapture(e.pointerId);
    touchPointsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    createParticles(e.clientX, e.clientY, settings.particleCount * 2, settings.vfxType);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (touchPointsRef.current.has(e.pointerId)) {
        touchPointsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        createParticles(e.clientX, e.clientY, Math.ceil(settings.particleCount / 2), settings.vfxType);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    canvasRef.current?.releasePointerCapture(e.pointerId);
    touchPointsRef.current.delete(e.pointerId);
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 touch-none cursor-crosshair"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
};

export default VFXCanvas;
