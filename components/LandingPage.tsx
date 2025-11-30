
import React, { useState } from 'react';
import { Play, BookOpen, X, Fingerprint, Zap, Layers, Sparkles, Code, Cpu } from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050508] text-white overflow-hidden">
      
      {/* Background Gradients for 'Rich' Feel */}
      <div className="absolute top-[-20%] left-0 w-full h-full bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-[-20%] right-0 w-[80%] h-[80%] bg-radial-gradient from-cyan-900/10 to-transparent pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>

      {/* Main Content */}
      {!showGuide ? (
        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl px-6 animate-in fade-in zoom-in-95 duration-1000">
          
          <div className="mb-10 scale-125">
             <Logo size="lg" />
          </div>

          {/* Typography */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200 mb-2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            VFX TOUCH
          </h1>
          <div className="flex items-center gap-4 mb-8">
             <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-white/40"></div>
             <p className="text-sm md:text-lg font-mono tracking-[0.5em] text-cyan-400/80 uppercase">Premium Studio</p>
             <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-white/40"></div>
          </div>

          <p className="max-w-xl text-white/50 text-sm md:text-base leading-relaxed font-light mb-10">
             The ultimate particle simulation engine. <br/>
             <span className="text-white/80">Silk Art. Neon Sparks. Zero Latency.</span>
          </p>

          {/* Premium Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
            <button 
              onClick={onGetStarted}
              className="relative group flex-1 py-4 px-8 bg-white text-black rounded-none border border-white font-bold tracking-[0.2em] overflow-hidden transition-all hover:bg-cyan-50 hover:border-cyan-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
              style={{ clipPath: "polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1s_infinite]"></div>
              START ENGINE
            </button>

            <button 
              onClick={() => setShowGuide(true)}
              className="flex-1 py-4 px-8 bg-transparent text-white border border-white/20 hover:border-white/60 font-bold tracking-[0.2em] transition-all hover:bg-white/5"
              style={{ clipPath: "polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)" }}
            >
              MANUAL
            </button>
          </div>

          {/* GNANESWAR Credit - High End */}
          <div className="mt-16 border-t border-white/5 pt-8 w-full max-w-2xl flex flex-col items-center">
             <div className="flex items-center gap-3 mb-2 opacity-50">
                <Code size={12} />
                <span className="text-[10px] tracking-[0.3em] uppercase">Architecture & Design</span>
             </div>
             <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-widest">
                GNANESWAR
             </h3>
             <p className="text-[10px] text-white/30 mt-2 max-w-xs leading-5">
                "Pushing the boundaries of web graphics to deliver a cinematic, touch-responsive experience."
             </p>
          </div>

        </div>
      ) : (
        /* Premium Guide Modal */
        <div className="bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 w-full h-full md:w-[90%] md:h-[90%] md:rounded-3xl relative z-50 flex flex-col animate-in slide-in-from-bottom-10 duration-500">
           <div className="flex justify-between items-center p-8 border-b border-white/5">
              <h2 className="text-2xl font-bold tracking-widest flex items-center gap-3">
                 <BookOpen className="text-cyan-400" /> SYSTEM MANUAL
              </h2>
              <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                 <X />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              {[
                 { icon: <Fingerprint />, title: "Interaction", desc: "Multi-touch physics engine. Drag to emit." },
                 { icon: <Zap />, title: "Neon Engine", desc: "High-dynamic range lighting with additive blending." },
                 { icon: <Sparkles />, title: "Silk Art", desc: "New smooth-curve rendering algorithm for artistic flows." },
                 { icon: <Cpu />, title: "AI Core", desc: "Integrated Gemini 2.5 Flash Lite for instant assistance." },
                 { icon: <Layers />, title: "Layering", desc: "Blur Clock overlay behind active particle systems." },
                 { icon: <Code />, title: "Developer", desc: "Hand-crafted by Gnaneswar for performance." },
              ].map((item, i) => (
                 <div key={i} className="bg-white/5 border border-white/5 p-6 hover:bg-white/10 transition-all group">
                    <div className="mb-4 text-cyan-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                 </div>
              ))}
           </div>
           
           <div className="p-8 border-t border-white/5 text-center">
              <button onClick={() => setShowGuide(false)} className="text-sm tracking-[0.2em] text-cyan-400 hover:text-white transition-colors">
                 CLOSE MANUAL
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
