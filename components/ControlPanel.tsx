

import React, { useEffect } from 'react';
import { Settings, Zap, Flame, Grid, CloudRain, Circle, Video, StopCircle, ArrowDown, Wind, Tornado, Binary, Aperture, Diamond, Moon, Play, Pause, EyeOff, Volume2, VolumeX, Speaker, Sparkles, Clock, Waves, Activity, ArrowRight, Ghost, Atom, Sun, Rainbow, Star, Camera, CameraOff } from 'lucide-react';
import { AppSettings, VFXType } from '../types';
import { soundEngine } from '../services/SoundEngine';

interface ControlPanelProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onToggleRecording: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ settings, setSettings, onToggleRecording }) => {
  
  // Sync volume with engine when slider moves
  useEffect(() => {
    soundEngine.setVolume(settings.isMuted ? 0 : settings.soundVolume);
  }, [settings.soundVolume, settings.isMuted]);

  if (!settings.showUI) return null;

  const vfxOptions = [
    // NEW ULTRA HD EFFECTS (Top Priority)
    { type: VFXType.QUANTUM_FLUX, icon: <Atom size={18} />, label: 'Quantum' },
    { type: VFXType.GOLDEN_AURORA, icon: <Sun size={18} />, label: 'Gold' },
    { type: VFXType.PRISM_RAYS, icon: <Rainbow size={18} />, label: 'Prism' },
    { type: VFXType.COSMIC_NOVA, icon: <Star size={18} />, label: 'Nova' },
    
    // Existing
    { type: VFXType.SILK_ART, icon: <Waves size={18} />, label: 'Silk' },
    { type: VFXType.NEON_SPARK, icon: <Zap size={18} />, label: 'Neon' },
    { type: VFXType.FIRE_TRAIL, icon: <Flame size={18} />, label: 'Fire' },
    { type: VFXType.CYBER_GRID, icon: <Grid size={18} />, label: 'Grid' },
    { type: VFXType.PARTICLE_STORM, icon: <CloudRain size={18} />, label: 'Storm' },
    { type: VFXType.PLASMA_WAVE, icon: <Circle size={18} />, label: 'Plasma' },
    { type: VFXType.VORTEX_SPIRAL, icon: <Tornado size={18} />, label: 'Vortex' },
    { type: VFXType.DATA_STREAM, icon: <Binary size={18} />, label: 'Data' },
    { type: VFXType.GALAXY_SWIRL, icon: <Aperture size={18} />, label: 'Galaxy' },
    { type: VFXType.CRYSTAL_SHARD, icon: <Diamond size={18} />, label: 'Shard' },
    { type: VFXType.BLOOD_MOON, icon: <Moon size={18} />, label: 'Blood' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-[90%] max-w-md">
      <div 
        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-opacity duration-300"
        style={{ opacity: settings.uiOpacity }}
      >
        
        {/* Header with Hide & Mute Button */}
        <div className="flex justify-between items-center mb-3 px-1">
           <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">VFX Console</h3>
           <div className="flex gap-3">
             <button 
                onClick={() => setSettings(prev => ({...prev, showClock: !prev.showClock}))}
                className={`transition-colors ${settings.showClock ? 'text-cyan-400' : 'text-white/30 hover:text-white'}`}
                title="Toggle VFX Clock"
             >
                <Clock size={14} />
             </button>
             <button 
               onClick={() => setSettings(prev => ({...prev, isMuted: !prev.isMuted}))}
               className={`transition-colors ${settings.isMuted ? 'text-red-400' : 'text-cyan-400 hover:text-cyan-300'}`}
               title={settings.isMuted ? "Unmute Sound" : "Mute Sound"}
             >
               {settings.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
             </button>
             <button 
               onClick={() => setSettings(prev => ({...prev, showUI: false}))}
               className="text-white/30 hover:text-white transition-colors"
               title="Hide Controls"
             >
               <EyeOff size={14} />
             </button>
           </div>
        </div>

        {/* VFX Selector */}
        <div className="grid grid-cols-5 gap-2 mb-5">
          {vfxOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => setSettings(prev => ({ ...prev, vfxType: opt.type }))}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                settings.vfxType === opt.type 
                  ? 'bg-white/20 text-cyan-400 scale-105 shadow-[0_0_10px_rgba(0,255,255,0.3)]' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {opt.icon}
              <span className="text-[9px] font-medium uppercase tracking-wider">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
          
          {/* Intensity (Span 2) */}
          <div className="col-span-2">
             <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Intensity</label>
                <span className="text-[10px] text-cyan-400 font-mono">{settings.particleCount}</span>
             </div>
             <input 
               type="range" 
               min="1" 
               max="30" 
               value={settings.particleCount} 
               onChange={(e) => setSettings(prev => ({...prev, particleCount: Number(e.target.value)}))}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-cyan-500/30 accent-cyan-400"
             />
          </div>

          {/* Bloom Control (Span 2) */}
          <div className="col-span-2">
             <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold flex items-center gap-1">
                   <Sparkles size={10} /> Bloom
                </label>
                <span className="text-[10px] text-yellow-400 font-mono">{settings.bloomIntensity.toFixed(1)}</span>
             </div>
             <input 
               type="range" 
               min="0" 
               max="3"
               step="0.1"
               value={settings.bloomIntensity} 
               onChange={(e) => setSettings(prev => ({...prev, bloomIntensity: Number(e.target.value)}))}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-yellow-500/30 accent-yellow-400"
             />
          </div>

          {/* Volume Control */}
          <div className="col-span-2">
             <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold flex items-center gap-1">
                   <Speaker size={10} /> Music Vol
                </label>
                <span className="text-[10px] text-green-400 font-mono">{(settings.soundVolume * 100).toFixed(0)}%</span>
             </div>
             <input 
               type="range" 
               min="0" 
               max="1"
               step="0.05"
               value={settings.soundVolume} 
               onChange={(e) => setSettings(prev => ({...prev, soundVolume: Number(e.target.value)}))}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-green-500/30 accent-green-400"
             />
          </div>
          
           {/* UI Opacity Control */}
           <div className="col-span-2">
             <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold flex items-center gap-1">
                   <Ghost size={10} /> UI Opacity
                </label>
                <span className="text-[10px] text-gray-400 font-mono">{(settings.uiOpacity * 100).toFixed(0)}%</span>
             </div>
             <input 
               type="range" 
               min="0.2" 
               max="1"
               step="0.1"
               value={settings.uiOpacity} 
               onChange={(e) => setSettings(prev => ({...prev, uiOpacity: Number(e.target.value)}))}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-gray-500/30 accent-gray-400"
             />
          </div>

          {/* Physics Tools: Gravity, Friction, Wind, Turbulence */}
          <div>
             <div className="flex justify-between items-center mb-1">
               <label className="text-[10px] text-white/50 uppercase tracking-wider flex items-center gap-1">
                 <ArrowDown size={10} /> Gravity
               </label>
               <span className="text-[10px] text-purple-400 font-mono">{settings.gravity.toFixed(2)}</span>
             </div>
             <input
               type="range"
               min="-0.5"
               max="1.0"
               step="0.05"
               value={settings.gravity}
               onChange={(e) => setSettings(prev => ({...prev, gravity: Number(e.target.value)}))}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-purple-500/30 accent-purple-500"
             />
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
               <label className="text-[10px] text-white/50 uppercase tracking-wider flex items-center gap-1">
                 <Wind size={10} /> Friction
               </label>
               <span className="text-[10px] text-orange-400 font-mono">{settings.friction.toFixed(2)}</span>
             </div>
             <input
               type="range"
               min="0.85"
               max="1.00"
               step="0.01"
               value={settings.friction}
               onChange={(e) => setSettings(prev => ({...prev, friction: Number(e.target.value)}))}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-orange-500/30 accent-orange-500"
             />
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
               <label className="text-[10px] text-white/50 uppercase tracking-wider flex items-center gap-1">
                 <ArrowRight size={10} /> Wind
               </label>
               <span className="text-[10px] text-blue-400 font-mono">{settings.wind.toFixed(1)}</span>
             </div>
             <input
               type="range"
               min="-2.0"
               max="2.0"
               step="0.1"
               value={settings.wind}
               onChange={(e) => setSettings(prev => ({...prev, wind: Number(e.target.value)}))}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-blue-500/30 accent-blue-500"
             />
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
               <label className="text-[10px] text-white/50 uppercase tracking-wider flex items-center gap-1">
                 <Activity size={10} /> Turbulence
               </label>
               <span className="text-[10px] text-pink-400 font-mono">{settings.turbulence.toFixed(1)}</span>
             </div>
             <input
               type="range"
               min="0"
               max="5.0"
               step="0.1"
               value={settings.turbulence}
               onChange={(e) => setSettings(prev => ({...prev, turbulence: Number(e.target.value)}))}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-pink-500/30 accent-pink-500"
             />
          </div>

        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-white/5 flex gap-2">
          <button
            onClick={() => setSettings(prev => ({...prev, isAutoPlay: !prev.isAutoPlay}))}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
              settings.isAutoPlay 
                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,255,255,0.4)]' 
                : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
             {settings.isAutoPlay ? <Pause size={18} /> : <Play size={18} />}
            <span className="text-xs uppercase tracking-widest">{settings.isAutoPlay ? 'Auto' : 'Play Demo'}</span>
          </button>
          
           <button
            onClick={() => setSettings(prev => ({...prev, isMotionControl: !prev.isMotionControl}))}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
              settings.isMotionControl 
                ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
             {settings.isMotionControl ? <Camera size={18} /> : <CameraOff size={18} />}
            <span className="text-xs uppercase tracking-widest">{settings.isMotionControl ? 'Motion' : 'Camera'}</span>
          </button>

          <button
            onClick={onToggleRecording}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
              settings.isRecording 
                ? 'bg-red-500/90 text-white animate-pulse shadow-[0_0_20px_rgba(255,0,0,0.4)]' 
                : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            {settings.isRecording ? <StopCircle size={18} /> : <Video size={18} />}
            <span className="text-xs uppercase tracking-widest">{settings.isRecording ? 'Stop' : 'Record'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ControlPanel;