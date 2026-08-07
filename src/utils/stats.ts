import type { ReadingStats } from '../types';

export function getReadingStats(text: string): ReadingStats {
  const normalized = text.trim();
  const words = normalized ? normalized.split(/\s+/).length : 0;
  return {
    words,
    characters: normalized.length,
    minutes: Math.max(1, Math.ceil(words / 220)),
  };
}
