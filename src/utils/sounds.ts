export const SOUNDS = {
  TASK_COMPLETE: '/sounds/366104__original_sound__confirmation-downward.wav',
  TASK_INCOMPLETE: '/sounds/807624__logicogonist__afrotom-weak-1.wav',
  TASK_DELETE: '/sounds/515835__newlocknew__ui_3-2-fhsandal-sinussytrusarpegiomultiprocessingrsmpl.wavz__drag-and-drop-1.wav',
  TASK_DRAG: '/sounds/582602__nezuai__ui-sound-3.wav',
  // Add more sounds here as needed
} as const;

export class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  private constructor() {
    // Initialize sounds
    Object.entries(SOUNDS).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.volume = this.volume;
      this.sounds.set(key, audio);
    });
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  play(soundKey: keyof typeof SOUNDS) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(soundKey);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log('Audio play failed:', err));
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.volume = this.volume;
    });
  }

  isEnabled() {
    return this.enabled;
  }

  getVolume() {
    return this.volume;
  }
} 