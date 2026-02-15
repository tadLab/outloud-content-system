interface StatusPillProps {
  icon: string;
  label: string;
  color: string;
}

export function StatusPill({ icon, label, color }: StatusPillProps) {
  return (
    <div
      className="flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-xl"
      style={{
        color,
        backgroundColor: `${color}15`,
      }}
    >
      <span>{icon}</span>
      <span className="opacity-90">{label}</span>
    </div>
  );
}
