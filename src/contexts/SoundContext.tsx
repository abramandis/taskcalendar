import React, { createContext, useContext, useState, useCallback } from 'react';
import { SoundManager, SOUNDS } from '../utils/sounds';

interface SoundContextType {
  enabled: boolean;
  volume: number;
  toggleSound: () => void;
  setVolume: (volume: number) => void;
  playSound: (soundKey: keyof typeof SOUNDS) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const soundManager = SoundManager.getInstance();

  const toggleSound = useCallback(() => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    soundManager.setEnabled(newEnabled);
  }, [enabled]);

  const handleSetVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
  }, []);

  const playSound = useCallback((soundKey: keyof typeof SOUNDS) => {
    soundManager.play(soundKey);
  }, []);

  return (
    <SoundContext.Provider value={{
      enabled,
      volume,
      toggleSound,
      setVolume,
      playSound
    }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
} 