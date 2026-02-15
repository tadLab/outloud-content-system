import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ScoreStatus } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAiScoreStatus(score: number): ScoreStatus {
  if (score >= 60) return { icon: '⚠️', color: '#FFB800', label: 'Rewrite needed' };
  if (score >= 30) return { icon: '◐', color: '#9A9A9A', label: 'Review suggested' };
  return { icon: '✓', color: '#34C759', label: 'Looks human' };
}

export function getTovScoreStatus(score: number): ScoreStatus {
  if (score >= 85) return { icon: '✓', color: '#34C759', label: 'On brand' };
  if (score >= 70) return { icon: '◐', color: '#FFB800', label: 'Minor tweaks' };
  return { icon: '✗', color: '#FF3B30', label: 'Off brand' };
}
