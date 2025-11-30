
import React from 'react';
import { Aperture, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'lg', className = '' }) => {
  const isLarge = size === 'lg';
  
  // Size mappings
  const containerSize = isLarge ? 'w-24 h-24' : 'w-10 h-10';
  const coreSize = isLarge ? 48 : 20;

  return (
    <div className={`relative flex items-center justify-center group ${className}`}>
      
      {/* 1. Background Radiant Burst (Large Glow) */}
      <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-40 animate-pulse ${isLarge ? 'scale-150' : 'scale-125'}`} />

      {/* 2. Main Container */}
      <div className={`relative ${containerSize} flex items-center justify-center`}>
        
        {/* Orbit 1 (Horizontal Ellipse) */}
        <div className={`absolute inset-0 border-[3px] border-cyan-400/60 rounded-full blur-[1px] animate-[spin_3s_linear_infinite]`} 
             style={{ clipPath: 'ellipse(100% 40% at 50% 50%)' }} />
             
        {/* Orbit 2 (Vertical Ellipse) */}
        <div className={`absolute inset-0 border-[3px] border-purple-500/60 rounded-full blur-[1px] animate-[spin_4s_linear_infinite_reverse]`} 
             style={{ clipPath: 'ellipse(40% 100% at 50% 50%)' }} />

        {/* Outer Tech Ring */}
        <div className="absolute inset-0 rounded-full border border-white/20 shadow-[0_0_15px_rgba(0,255,255,0.3)] animate-[spin_10s_linear_infinite]" />

        {/* 3. The Core (VFX Engine) */}
        <div className="relative z-10 bg-black rounded-full p-2 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center overflow-hidden">
            {/* Inner Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 to-purple-900 opacity-80" />
            
            {/* Icon */}
            <Aperture 
               size={coreSize} 
               className="relative z-10 text-white animate-[spin_12s_linear_infinite] drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" 
            />
            
            {/* Core Flash */}
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
        </div>
      </div>

      {/* 4. Floating Particles (Sparkles) */}
      <Sparkles 
        size={isLarge ? 28 : 14} 
        className="absolute -top-2 -right-2 text-cyan-300 animate-bounce drop-shadow-[0_0_10px_rgba(0,255,255,1)]" 
      />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full blur-[1px] animate-ping" />

    </div>
  );
};

export default Logo;
