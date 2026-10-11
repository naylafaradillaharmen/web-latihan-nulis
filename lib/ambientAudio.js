/**
 * Inkly Ambient Sound Synthesizer (Web Audio API)
 * Pure in-browser procedural sound generation: zero network, zero assets.
 */

class AmbientSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.gainNode = null;
    this.filterNode = null;
    this.sourceNode = null;
    this.lfoNode = null;
    this.lfoGain = null;
    this.isPlaying = false;
    this.currentPreset = "rain"; // "rain" | "waves" | "breeze"
    this.volume = 0.45;
  }

  init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.audioCtx = new AudioContextClass();
  }

  createPinkNoiseBuffer(seconds = 4) {
    if (!this.audioCtx) return null;
    const sampleRate = this.audioCtx.sampleRate;
    const bufferSize = sampleRate * seconds;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.76160 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.085;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  play(preset = "rain") {
    this.init();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    if (this.isPlaying) {
      this.stop();
    }

    this.currentPreset = preset;
    const buffer = this.createPinkNoiseBuffer(5);
    if (!buffer) return;

    // Looping source
    this.sourceNode = this.audioCtx.createBufferSource();
    this.sourceNode.buffer = buffer;
    this.sourceNode.loop = true;

    // Filter node based on preset
    this.filterNode = this.audioCtx.createBiquadFilter();

    if (preset === "rain") {
      this.filterNode.type = "lowpass";
      this.filterNode.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      this.filterNode.Q.setValueAtTime(1.1, this.audioCtx.currentTime);
    } else if (preset === "waves") {
      this.filterNode.type = "lowpass";
      this.filterNode.frequency.setValueAtTime(450, this.audioCtx.currentTime);
      this.filterNode.Q.setValueAtTime(1.5, this.audioCtx.currentTime);

      // LFO to swell waves every 6-7 seconds
      this.lfoNode = this.audioCtx.createOscillator();
      this.lfoNode.type = "sine";
      this.lfoNode.frequency.setValueAtTime(0.14, this.audioCtx.currentTime);

      this.lfoGain = this.audioCtx.createGain();
      this.lfoGain.gain.setValueAtTime(260, this.audioCtx.currentTime);

      this.lfoNode.connect(this.lfoGain);
      this.lfoGain.connect(this.filterNode.frequency);
      this.lfoNode.start();
    } else if (preset === "breeze") {
      this.filterNode.type = "bandpass";
      this.filterNode.frequency.setValueAtTime(500, this.audioCtx.currentTime);
      this.filterNode.Q.setValueAtTime(0.8, this.audioCtx.currentTime);

      // Gentle LFO for wind gust
      this.lfoNode = this.audioCtx.createOscillator();
      this.lfoNode.type = "sine";
      this.lfoNode.frequency.setValueAtTime(0.2, this.audioCtx.currentTime);

      this.lfoGain = this.audioCtx.createGain();
      this.lfoGain.gain.setValueAtTime(180, this.audioCtx.currentTime);

      this.lfoNode.connect(this.lfoGain);
      this.lfoGain.connect(this.filterNode.frequency);
      this.lfoNode.start();
    }

    // Main Master Gain Node with gentle fade-in
    this.gainNode = this.audioCtx.createGain();
    const targetVol = this.volume;
    this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(
      Math.max(0.01, targetVol),
      this.audioCtx.currentTime + 1.2
    );

    // Chain: source -> filter -> gain -> destination
    this.sourceNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);

    this.sourceNode.start();
    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;
    try {
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioCtx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(
          0.0001,
          this.audioCtx.currentTime + 0.6
        );
      }
      setTimeout(() => {
        try {
          if (this.sourceNode) {
            this.sourceNode.stop();
            this.sourceNode.disconnect();
          }
          if (this.lfoNode) {
            this.lfoNode.stop();
            this.lfoNode.disconnect();
          }
          if (this.filterNode) this.filterNode.disconnect();
          if (this.gainNode) this.gainNode.disconnect();
        } catch {
          // ignore cleanup errors
        }
      }, 700);
    } catch {
      // ignore
    }
    this.isPlaying = false;
  }

  setVolume(newVol) {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (this.gainNode && this.audioCtx && this.isPlaying) {
      this.gainNode.gain.setValueAtTime(
        Math.max(0.001, this.volume),
        this.audioCtx.currentTime + 0.1
      );
    }
  }
}

// Global singleton instance so audio doesn't glitch across re-renders
let engineInstance = null;

export function getAmbientSoundEngine() {
  if (typeof window === "undefined") return null;
  if (!engineInstance) {
    engineInstance = new AmbientSoundEngine();
  }
  return engineInstance;
}
