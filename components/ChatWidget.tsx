
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Cpu, Zap, BrainCircuit, Sparkles, Loader2, Image as ImageIcon, Paperclip, MessageSquare, Layout } from 'lucide-react';
import { ChatMode, ChatMessage } from '../types';
import { streamChatResponse } from '../services/geminiService';
import TaskManager from './TaskManager';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'manager'>('chat');
  const [mode, setMode] = useState<ChatMode>(ChatMode.SMART);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Ready to visualize your ideas? Ask me anything about VFX or just chat!', timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, activeView]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };
    
    if (selectedImage) {
        userMsg.text = input ? `[Image Uploaded] ${input}` : `[Image Uploaded]`;
    }

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const imageToSend = selectedImage ? selectedImage.split(',')[1] : undefined;
    setSelectedImage(null);
    setIsLoading(true);

    const tempId = (Date.now() + 1).toString();
    const modelMsg: ChatMessage = {
      id: tempId,
      role: 'model',
      text: '',
      isStreaming: true,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, modelMsg]);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const streamResult = await streamChatResponse(userMsg.text, history, mode, imageToSend);

      for await (const chunk of streamResult) {
        const text = chunk.text;
        if (text) {
          setMessages(prev => prev.map(m => 
            m.id === tempId ? { ...m, text: m.text + text } : m
          ));
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, text: "System Interface Error. Please try again." } : m
      ));
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, isStreaming: false } : m
      ));
    }
  };

  return (
    <>
      {/* AI Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-6 right-6 z-30 flex items-center justify-center w-12 h-12 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-white text-black rotate-90' : 'bg-gradient-to-br from-cyan-600 to-purple-600 text-white border border-cyan-400/50'
        }`}
      >
        {isOpen ? <X size={24} /> : <span className="font-black text-xs tracking-tighter">AI</span>}
      </button>

      {/* Main Container */}
      <div 
        className={`fixed top-20 right-6 w-80 md:w-96 max-w-[90vw] h-[65vh] md:h-[550px] z-30 flex flex-col transition-all duration-300 transform origin-top-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <div className="flex-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Sparkles className="text-cyan-400" size={18} />
              AI Assistant
            </h3>
            
            {/* View Switcher Tabs */}
            <div className="flex bg-black/40 rounded-lg p-0.5">
               <button 
                 onClick={() => setActiveView('chat')}
                 className={`p-1.5 rounded transition-colors ${activeView === 'chat' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
                 title="Chat"
               >
                 <MessageSquare size={14} />
               </button>
               <button 
                 onClick={() => setActiveView('manager')}
                 className={`p-1.5 rounded transition-colors ${activeView === 'manager' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
                 title="Task Manager"
               >
                 <Layout size={14} />
               </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-hidden relative">
            
            {/* CHAT VIEW */}
            {activeView === 'chat' && (
              <div className="absolute inset-0 flex flex-col">
                {/* Mode Selector */}
                <div className="px-4 py-2 border-b border-white/5">
                  <div className="flex bg-black/40 rounded-lg p-1 gap-1">
                    <button onClick={() => setMode(ChatMode.FAST)} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[10px] font-bold uppercase transition-all ${mode === ChatMode.FAST ? 'bg-cyan-500 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}><Zap size={12} /> Fast</button>
                    <button onClick={() => setMode(ChatMode.SMART)} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[10px] font-bold uppercase transition-all ${mode === ChatMode.SMART ? 'bg-purple-500 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}><Cpu size={12} /> Smart</button>
                    <button onClick={() => setMode(ChatMode.THINKING)} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[10px] font-bold uppercase transition-all ${mode === ChatMode.THINKING ? 'bg-amber-500 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}><BrainCircuit size={12} /> Think</button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-cyan-600/80 text-white rounded-br-none' : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5'}`}>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                        {msg.isStreaming && <span className="inline-block w-2 h-2 ml-2 bg-cyan-400 rounded-full animate-pulse" />}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-white/10 bg-black/40">
                  {selectedImage && (
                    <div className="relative mb-2 w-16 h-16 rounded-lg overflow-hidden border border-cyan-500/50 group">
                      <img src={selectedImage} alt="Upload" className="w-full h-full object-cover" />
                      <button onClick={() => setSelectedImage(null)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><X size={14} /></button>
                    </div>
                  )}
                  <div className="relative flex items-center gap-2">
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageSelect} />
                    <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-lg transition-colors ${selectedImage ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/50 hover:text-white hover:bg-white/10'}`} title="Upload Image"><Paperclip size={18} /></button>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={isLoading ? "Processing..." : "Ask AI..."}
                      disabled={isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder-white/30"
                    />
                    <button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedImage)} className="absolute right-2 p-2 bg-cyan-500/80 text-white rounded-lg hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500/80 transition-all">
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MANAGER VIEW */}
            {activeView === 'manager' && (
              <div className="absolute inset-0">
                <TaskManager />
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
};

export default ChatWidget;
