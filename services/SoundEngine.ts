
import { VFXType } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private currentVolume: number = 0.5;
  
  // Music Sequencer State
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private currentNoteIndex: number = 0;
  private timerID: number | null = null;
  private tempo: number = 60; // Slow, emotional bpm

  // Interstellar-esque Arpeggio Pattern (A Minor -> F Major -> C Major -> G Major)
  // Frequencies for a cinematic, emotional feel
  private sequence = [
    // Am
    { freq: 220.00, dur: 0.5 }, { freq: 261.63, dur: 0.5 }, { freq: 329.63, dur: 0.5 }, { freq: 440.00, dur: 0.5 },
    { freq: 329.63, dur: 0.5 }, { freq: 261.63, dur: 0.5 }, { freq: 220.00, dur: 1.0 },
    // F
    { freq: 174.61, dur: 0.5 }, { freq: 261.63, dur: 0.5 }, { freq: 349.23, dur: 0.5 }, { freq: 440.00, dur: 0.5 },
    { freq: 349.23, dur: 0.5 }, { freq: 261.63, dur: 0.5 }, { freq: 174.61, dur: 1.0 },
    // C
    { freq: 261.63, dur: 0.5 }, { freq: 329.63, dur: 0.5 }, { freq: 392.00, dur: 0.5 }, { freq: 523.25, dur: 0.5 },
    { freq: 392.00, dur: 0.5 }, { freq: 329.63, dur: 0.5 }, { freq: 261.63, dur: 1.0 },
    // G (Low tension)
    { freq: 196.00, dur: 0.5 }, { freq: 246.94, dur: 0.5 }, { freq: 293.66, dur: 0.5 }, { freq: 392.00, dur: 0.5 },
    { freq: 293.66, dur: 0.5 }, { freq: 246.94, dur: 0.5 }, { freq: 196.00, dur: 1.0 },
  ];

  init() {
    if (this.ctx) return;
    
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    
    // Master Chain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.currentVolume;
    
    // Reverb for cinematic atmosphere
    this.reverbNode = this.ctx.createConvolver();
    this.generateImpulseResponse();
    
    // Compressor to even out levels
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    // Chain: Reverb -> Compressor -> Master
    this.reverbNode.connect(compressor);
    compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  setVolume(vol: number) {
    this.currentVolume = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.2);
    }
  }

  private generateImpulseResponse() {
    if (!this.ctx || !this.reverbNode) return;
    const rate = this.ctx.sampleRate;
    const length = rate * 4.0; // 4 seconds reverb tail for "Endless Space" feel
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    
    for (let i = 0; i < length; i++) {
      const decay = Math.pow(1 - i / length, 3);
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    this.reverbNode.buffer = impulse;
  }

  startBackgroundMusic() {
    if (this.isPlaying || !this.ctx) {
        // Just ensure context is running if already playing
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        return;
    }
    
    this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();

    this.isPlaying = true;
    this.nextNoteTime = this.ctx!.currentTime + 0.1;
    this.scheduler();
  }

  // Lookahead scheduler to schedule notes in advance
  private scheduler() {
    if (!this.ctx) return;

    // While there are notes that will need to play before the next interval, 
    // schedule them and advance the pointer.
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
        this.scheduleNote(this.currentNoteIndex, this.nextNoteTime);
        this.advanceNote();
    }
    
    this.timerID = window.setTimeout(this.scheduler.bind(this), 25);
  }

  private advanceNote() {
      // Get duration of current note
      const secondsPerBeat = 60.0 / this.tempo;
      // We speed up the arpeggio slightly for flow: 0.5 beat per note usually
      const note = this.sequence[this.currentNoteIndex];
      this.nextNoteTime += note.dur * (secondsPerBeat * 0.5); 
      
      this.currentNoteIndex++;
      if (this.currentNoteIndex >= this.sequence.length) {
          this.currentNoteIndex = 0;
      }
  }

  private scheduleNote(index: number, time: number) {
      if (!this.ctx || !this.reverbNode || !this.masterGain) return;

      const note = this.sequence[index];
      
      // Create Piano Sound
      // 1. Fundamental (Sine)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = note.freq;

      // 2. Harmonics (Triangle - subtle)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.value = note.freq;
      
      // 3. Detuned layer for width (Interstellar vibe)
      const osc3 = this.ctx.createOscillator();
      const gain3 = this.ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.value = note.freq * 1.001; // Slight detune

      // Envelope for Piano (Sharp attack, exponential decay)
      const attack = 0.02;
      const decay = 1.5;
      const sustain = 0.0;
      
      // Volume Envelopes
      gain1.gain.setValueAtTime(0, time);
      gain1.gain.linearRampToValueAtTime(0.4, time + attack);
      gain1.gain.exponentialRampToValueAtTime(0.001, time + decay);

      gain2.gain.setValueAtTime(0, time);
      gain2.gain.linearRampToValueAtTime(0.1, time + attack); // Lower volume for harmonics
      gain2.gain.exponentialRampToValueAtTime(0.001, time + decay * 0.8);

      gain3.gain.setValueAtTime(0, time);
      gain3.gain.linearRampToValueAtTime(0.1, time + attack);
      gain3.gain.exponentialRampToValueAtTime(0.001, time + decay);

      // Connect
      // Wet Mix (To Reverb)
      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(this.reverbNode);
      gain2.connect(this.reverbNode);
      gain3.connect(this.reverbNode);

      // Dry Mix (Direct to Master for clarity)
      const dryGain = this.ctx.createGain();
      dryGain.gain.value = 0.3;
      gain1.connect(dryGain);
      dryGain.connect(this.masterGain);

      // Start/Stop
      osc1.start(time);
      osc2.start(time);
      osc3.start(time);
      
      osc1.stop(time + decay + 0.1);
      osc2.stop(time + decay + 0.1);
      osc3.stop(time + decay + 0.1);
  }

  // Deprecated but kept for type compatibility if needed, but implementation effectively does nothing now
  // or could trigger a very subtle layer if desired. 
  play(type: VFXType) {
     // No SFX on touch anymore, strictly music.
  }
}

export const soundEngine = new SoundEngine();
