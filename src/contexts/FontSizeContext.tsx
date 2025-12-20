import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getFontSizePreset, storeFontSizePreset, type FontSizePreset } from '../utils/storage';

type FontSizeContextType = {
  preset: FontSizePreset;
  multiplier: number;
  setPreset: (preset: FontSizePreset) => Promise<void>;
};

const PRESET_MULTIPLIER: Record<FontSizePreset, number> = {
  xs: 0.85,
  s: 0.93,
  m: 1.0,
  l: 1.1,
  xl: 1.22,
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preset, setPresetState] = useState<FontSizePreset>('m');

  useEffect(() => {
    let alive = true;
    (async () => {
      const saved = await getFontSizePreset();
      if (!alive) {
        return;
      }
      if (saved) {
        setPresetState(saved);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const multiplier = PRESET_MULTIPLIER[preset] ?? 1.0;

  const setPreset = async (next: FontSizePreset) => {
    setPresetState(next);
    await storeFontSizePreset(next);
  };

  const value = useMemo<FontSizeContextType>(
    () => ({ preset, multiplier, setPreset }),
    [preset, multiplier],
  );

  return <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>;
};

export function useFontSize() {
  const ctx = useContext(FontSizeContext);
  if (!ctx) {
    throw new Error('useFontSize must be used within FontSizeProvider');
  }
  return ctx;
}


