

export interface Point {
  x: number;
  y: number;
}

export enum VFXType {
  // New Ultra HD Effects
  QUANTUM_FLUX = 'QUANTUM_FLUX',
  GOLDEN_AURORA = 'GOLDEN_AURORA',
  PRISM_RAYS = 'PRISM_RAYS',
  COSMIC_NOVA = 'COSMIC_NOVA',
  
  // Existing
  SILK_ART = 'SILK_ART',
  NEON_SPARK = 'NEON_SPARK',
  FIRE_TRAIL = 'FIRE_TRAIL',
  CYBER_GRID = 'CYBER_GRID',
  PARTICLE_STORM = 'PARTICLE_STORM',
  PLASMA_WAVE = 'PLASMA_WAVE',
  VORTEX_SPIRAL = 'VORTEX_SPIRAL',
  DATA_STREAM = 'DATA_STREAM',
  GALAXY_SWIRL = 'GALAXY_SWIRL',
  CRYSTAL_SHARD = 'CRYSTAL_SHARD',
  BLOOD_MOON = 'BLOOD_MOON'
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: VFXType;
  history?: Point[]; // For trails
  rotation?: number; // For rotating shapes
  rotationSpeed?: number;
  char?: string; // For data stream text
}

export enum ChatMode {
  FAST = 'FAST',
  SMART = 'SMART',
  THINKING = 'THINKING'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  timestamp: number;
}

export interface AppSettings {
  vfxType: VFXType;
  particleCount: number;
  bloomIntensity: number;
  isRecording: boolean;
  isAutoPlay: boolean;
  isMotionControl: boolean;
  showUI: boolean;
  showClock: boolean;
  backgroundMode: 'BLACK' | 'GRADIENT' | 'SPACE';
  gravity: number;
  friction: number;
  wind: number;
  turbulence: number;
  isMuted: boolean;
  soundVolume: number;
  uiOpacity: number;
}