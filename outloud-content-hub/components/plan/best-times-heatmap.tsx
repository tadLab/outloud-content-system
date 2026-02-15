'use client';

import { Platform } from '@/types';
import { BEST_POSTING_TIMES } from '@/lib/constants';

interface BestTimesHeatmapProps {
  platform: Platform;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function BestTimesHeatmap({ platform }: BestTimesHeatmapProps) {
  const config = BEST_POSTING_TIMES[platform];

  // Collect unique time slots from config
  const timeSlots = config.bestTimes.map((t) => t.time);

  const getCellStatus = (day: string, time: string): 'optimal' | 'good' | 'ok' | 'avoid' => {
    if (config.avoidDays.includes(day)) return 'avoid';
    const isBestDay = config.bestDays.includes(day);
    const timeConfig = config.bestTimes.find((t) => t.time === time);

    if (isBestDay && timeConfig?.engagement === 'highest') return 'optimal';
    if (isBestDay && timeConfig?.engagement === 'high') return 'good';
    if (isBestDay && timeConfig) return 'ok';
    if (timeConfig) return 'ok';
    return 'avoid';
  };

  const statusSymbols: Record<string, string> = {
    optimal: '\u2605',
    good: '\u25CF',
    ok: '\u25CB',
    avoid: '\u00B7',
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[16px]">{config.icon}</span>
        <span className="text-[14px] font-semibold text-[var(--text-primary)]">{config.name}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="text-[12px]">
          <thead>
            <tr>
              <th className="w-14 text-left pr-2 text-[var(--text-muted)] font-medium text-[11px]"></th>
              {DAY_LABELS.map((day) => (
                <th key={day} className="w-10 text-center text-[var(--text-muted)] font-medium text-[11px] pb-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time}>
                <td className="text-[var(--text-muted)] pr-2 py-0.5 text-[11px]">{time}</td>
                {DAYS.map((day) => {
                  const status = getCellStatus(day, time);
                  let cellStyle = '';
                  let textColor = '';

                  switch (status) {
                    case 'optimal':
                      cellStyle = 'bg-[var(--success)]';
                      textColor = 'text-white';
                      break;
                    case 'good':
                      cellStyle = 'bg-[var(--success)] opacity-60';
                      textColor = 'text-white';
                      break;
                    case 'ok':
                      cellStyle = 'bg-[var(--success)] opacity-30';
                      textColor = 'text-[var(--text-primary)]';
                      break;
                    case 'avoid':
                      cellStyle = 'bg-[var(--bg-tertiary)] opacity-40';
                      textColor = 'text-[var(--text-disabled)]';
                      break;
                  }

                  return (
                    <td key={`${day}-${time}`} className="text-center p-0.5">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] ${cellStyle} ${textColor}`}
                        title={`${day} ${time}: ${status}`}
                      >
                        {statusSymbols[status]}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] mt-3">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-sm bg-[var(--success)] flex items-center justify-center text-white text-[9px]">{'\u2605'}</span>
          Optimal
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-sm bg-[var(--success)] opacity-60 flex items-center justify-center text-white text-[9px]">{'\u25CF'}</span>
          Good
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-sm bg-[var(--success)] opacity-30 flex items-center justify-center text-[9px]">{'\u25CB'}</span>
          OK
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-sm bg-[var(--bg-tertiary)] opacity-40 flex items-center justify-center text-[9px]">{'\u00B7'}</span>
          Avoid
        </span>
      </div>

      <p className="text-[11px] text-[var(--text-muted)] mt-2 italic">{config.notes}</p>
    </div>
  );
}
