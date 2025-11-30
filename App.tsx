
import React, { useState, useRef, useEffect } from 'react';
import VFXCanvas from './components/VFXCanvas';
import ControlPanel from './components/ControlPanel';
import ChatWidget from './components/ChatWidget';
import LandingPage from './components/LandingPage';
import Logo from './components/Logo';
import { AppSettings, VFXType } from './types';
import { Download, Eye, HelpCircle, ChevronRight, Check } from 'lucide-react';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    vfxType: VFXType.GALAXY_SWIRL, // Start with something impressive for the background
    particleCount: 8,
    bloomIntensity: 1.5,
    isRecording: false,
    isAutoPlay: true, // Auto play on landing page
    isMotionControl: false,
    showUI: false,    // Hide UI on landing page
    showClock: false, // Default clock off, user can enable
    backgroundMode: 'BLACK',
    gravity: 0.1,
    friction: 0.98,
    wind: 0,
    turbulence: 0,
    isMuted: false,
    soundVolume: 0.5,
    uiOpacity: 0.9,
  });

  // Tutorial State
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleGetStarted = () => {
    setHasStarted(true);
    setSettings(prev => ({
      ...prev,
      isAutoPlay: false, // Stop auto play so user can interact
      showUI: true,      // Show controls
      vfxType: VFXType.NEON_SPARK // Switch to default/starter effect
    }));
  };

  // Handle Recording Logic
  const toggleRecording = () => {
    if (settings.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!canvasRef.current) return;
    
    // Ensure the stream is captured at decent FPS
    const stream = canvasRef.current.captureStream(60); 
    const options = { mimeType: 'video/webm;codecs=vp9' };
    
    // Fallback if vp9 not supported
    const mimeType = MediaRecorder.isTypeSupported(options.mimeType) 
      ? options.mimeType 
      : 'video/webm';

    try {
      const recorder = new MediaRecorder(stream, { mimeType });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        chunksRef.current = [];
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setSettings(prev => ({ ...prev, isRecording: true }));
      setDownloadUrl(null); // Clear previous
    } catch (err) {
      console.error("Recording start failed:", err);
      alert("Screen recording not supported on this browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setSettings(prev => ({ ...prev, isRecording: false }));
    }
  };

  // Tutorial Logic
  const tutorialSteps = [
    {
      title: "Welcome to VFX Studio",
      desc: "Experience high-fidelity interactive art. Touch, swipe, and create cinematic particles instantly.",
      position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    },
    {
      title: "Control Panel",
      desc: "Use the bottom console to switch Effects (Quantum, Silk, Fire), adjust Physics (Wind, Gravity), or toggle the Zen Clock.",
      position: "bottom-80 left-1/2 -translate-x-1/2"
    },
    {
      title: "AI & Task Manager",
      desc: "Tap the AI button (Top Right). Chat with Gemini 2.5, generate ideas, AND manage your daily tasks/notes in the new Manager tab.",
      position: "top-24 right-10 origin-top-right"
    },
    {
      title: "Motion & Recording",
      desc: "Enable 'Motion' to control particles with your webcam, or press 'Record' to save your creation as a video.",
      position: "bottom-40 left-1/2 -translate-x-1/2"
    },
    {
      title: "You're Ready",
      desc: "Relax with the endless piano music and unleash your creativity. Press Finish to start.",
      position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    }
  ];

  const startTutorial = () => {
    setSettings(prev => ({ ...prev, showUI: true })); // Ensure UI is visible
    setTutorialStep(0);
    setIsTutorialActive(true);
  };

  const handleNextStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setIsTutorialActive(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      
      {/* Background Gradient for Aesthetics (visible if canvas alpha allows) */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#050510] to-[#0a0510] -z-10" />

      {/* Main Engine */}
      <VFXCanvas 
        settings={settings} 
        onCanvasRef={(ref) => canvasRef.current = ref} 
      />

      {/* Landing Page Overlay */}
      {!hasStarted && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}

      {/* Main App Overlay UI */}
      <div className={`relative z-10 pointer-events-none w-full h-full transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header */}
        {hasStarted && (
          <div 
            style={{ opacity: settings.showUI ? settings.uiOpacity : undefined }}
            className={`absolute top-0 left-0 p-6 pointer-events-auto transition-opacity duration-500 flex items-center gap-4 ${settings.showUI ? '' : 'opacity-30 hover:opacity-100'}`}
          >
            <Logo size="sm" />
            <div>
               <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tighter filter drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                 VFX TOUCH
               </h1>
               <div className="flex items-center gap-3">
                  <p className="text-[9px] text-white/40 font-mono tracking-widest">STUDIO BUILD 1.0</p>
                  <button 
                    onClick={startTutorial}
                    className="flex items-center gap-1 text-[9px] text-cyan-400 hover:text-white uppercase tracking-wider bg-cyan-900/30 hover:bg-cyan-500/50 border border-cyan-500/30 px-2 py-0.5 rounded transition-all"
                  >
                    <HelpCircle size={10} /> Tutorial
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Download Popup */}
        {downloadUrl && (
          <div className="absolute top-24 left-6 pointer-events-auto animate-bounce">
            <a 
              href={downloadUrl} 
              download={`vfx-creation-${Date.now()}.webm`}
              className="flex items-center gap-2 bg-green-500 text-black px-4 py-2 rounded-lg font-bold shadow-[0_0_20px_rgba(0,255,0,0.5)] hover:bg-green-400 transition-colors"
              onClick={() => setTimeout(() => setDownloadUrl(null), 1000)}
            >
              <Download size={18} />
              Save Recording
            </a>
          </div>
        )}

        {/* Controls */}
        <div className="pointer-events-auto">
          {hasStarted && (
            <ControlPanel 
              settings={settings} 
              setSettings={setSettings} 
              onToggleRecording={toggleRecording} 
            />
          )}

          {/* Show UI Button (Visible when UI is hidden) */}
          {hasStarted && !settings.showUI && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
              <button
                onClick={() => setSettings(prev => ({...prev, showUI: true}))}
                className="bg-black/20 backdrop-blur-md border border-white/10 text-white/30 hover:text-white hover:bg-black/60 p-3 rounded-full transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
                title="Show Controls"
              >
                <Eye size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="pointer-events-auto">
          {hasStarted && <ChatWidget />}
        </div>
      </div>
      
      {/* Tutorial Overlay */}
      {isTutorialActive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm pointer-events-auto transition-all duration-300">
           
           {/* Step Card */}
           <div className={`absolute ${tutorialSteps[tutorialStep].position} max-w-xs w-full transition-all duration-500 ease-in-out`}>
               <div className="bg-[#0f1016]/90 border border-cyan-500/50 p-6 rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.2)] relative animate-in zoom-in-95 duration-300">
                   
                   {/* Step Number Badge */}
                   <div className="absolute -top-4 -left-4 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-black font-black text-lg border-4 border-black shadow-[0_0_20px_rgba(0,255,255,0.5)]">
                       {tutorialStep + 1}
                   </div>
                   
                   <h3 className="text-xl font-bold text-white mb-3 mt-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200">
                     {tutorialSteps[tutorialStep].title}
                   </h3>
                   
                   <p className="text-gray-300 text-sm leading-relaxed mb-6 font-light">
                       {tutorialSteps[tutorialStep].desc}
                   </p>
                   
                   <div className="flex justify-between items-center">
                       <button 
                          onClick={() => setIsTutorialActive(false)}
                          className="text-xs text-white/40 hover:text-white uppercase tracking-wider font-bold"
                       >
                          Skip Tour
                       </button>
                       <button 
                          onClick={handleNextStep}
                          className="group bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/30"
                       >
                          {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                          {tutorialStep === tutorialSteps.length - 1 ? <Check size={16}/> : <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>}
                       </button>
                   </div>

                   {/* Decorative Corner */}
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-xl pointer-events-none"></div>
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-xl pointer-events-none"></div>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;
