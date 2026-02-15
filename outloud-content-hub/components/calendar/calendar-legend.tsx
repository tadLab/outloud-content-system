'use client';

export function CalendarLegend() {
  const items = [
    { label: 'Scheduled', color: '#3B82F6' },
    { label: 'Posted', color: '#22C55E' },
    { label: 'Missed', color: '#EF4444' },
  ];

  return (
    <div className="flex items-center gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[11px] text-[var(--text-secondary)]">{item.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div
          className="w-2.5 h-2.5 rounded-sm"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #2A2A2A 2px, #2A2A2A 4px)',
          }}
        />
        <span className="text-[11px] text-[var(--text-secondary)]">Gap</span>
      </div>
    </div>
  );
}
