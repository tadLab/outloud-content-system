import { Platform } from '@/types';
import { BEST_POSTING_TIMES } from '@/lib/constants';

export function getPostingRecommendation(
  platform: Platform,
  dateTime: Date
): 'optimal' | 'good' | 'avoid' | 'neutral' {
  const config = BEST_POSTING_TIMES[platform];
  const dayName = dateTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  if (config.avoidDays.includes(dayName)) return 'avoid';
  if (config.avoidTimes.includes(timeStr)) return 'avoid';

  const isBestDay = config.bestDays.includes(dayName);
  const bestTime = config.bestTimes.find((t) => t.time === timeStr);

  if (isBestDay && bestTime?.engagement === 'highest') return 'optimal';
  if (isBestDay && bestTime) return 'good';
  if (bestTime) return 'good';

  return 'neutral';
}

export interface RecommendedTime {
  dateTime: Date;
  rating: 'optimal' | 'good';
  label: string;
}

export function getNextRecommendedTimes(
  platform: Platform,
  count: number
): RecommendedTime[] {
  const config = BEST_POSTING_TIMES[platform];
  const results: RecommendedTime[] = [];
  const now = new Date();
  const checkDate = new Date(now);
  checkDate.setHours(0, 0, 0, 0);

  for (let d = 0; d < 14 && results.length < count; d++) {
    const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    if (config.bestDays.includes(dayName)) {
      for (const timeSlot of config.bestTimes) {
        if (results.length >= count) break;
        const [hours, minutes] = timeSlot.time.split(':').map(Number);
        const dateTime = new Date(checkDate);
        dateTime.setHours(hours, minutes, 0, 0);

        if (dateTime <= now) continue;

        results.push({
          dateTime,
          rating: timeSlot.engagement === 'highest' ? 'optimal' : 'good',
          label: timeSlot.label,
        });
      }
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  return results.slice(0, count);
}
