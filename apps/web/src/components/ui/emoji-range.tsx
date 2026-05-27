type EmojiRangeProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  emojiForValue: (value: number) => string;
  gradientForValue: (value: number) => string;
  hintForValue?: (value: number) => string;
};

export function EmojiRange({
  label,
  value,
  min = 1,
  max = 10,
  onChange,
  emojiForValue,
  gradientForValue,
  hintForValue,
}: EmojiRangeProps) {
  const emoji = emojiForValue(value);
  const gradient = gradientForValue(value);
  const hint = hintForValue?.(value);

  return (
    <div className="gymek-subcard">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="text-2xl leading-none" title={hint}>
          {emoji}
        </span>
      </div>
      <input
        className="emoji-range-input h-2 w-full cursor-grab appearance-none rounded-full active:cursor-grabbing"
        max={max}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${gradient})`,
        }}
        type="range"
        value={value}
      />
      <div className="mt-1.5 flex justify-between text-[10px] text-zinc-500">
        <span>{min}</span>
        <span className="font-medium text-zinc-800 dark:text-zinc-300">{value}</span>
        <span>{max}</span>
      </div>
      {hint ? <p className="mt-1 text-center text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export function moodEmoji(value: number): string {
  if (value <= 2) return "😵‍💫";
  if (value <= 4) return "😑";
  if (value <= 6) return "🙂";
  if (value <= 8) return "😄";
  return "🧌";
}

export function moodGradient(value: number): string {
  const stops = [
    "#52525b",
    "#71717a",
    "#a1a1aa",
    "#4ade80",
    "#22d3ee",
    "#a78bfa",
    "#f472b6",
    "#fbbf24",
    "#fb923c",
    "#f97316",
  ];
  const index = Math.min(Math.max(value - 1, 0), stops.length - 1);
  const next = Math.min(index + 1, stops.length - 1);
  return `${stops[index]}, ${stops[next]}`;
}

export function moodHint(value: number): string {
  if (value <= 3) return "офисный гоблин mode";
  if (value <= 6) return "норм, живём";
  if (value <= 8) return "почти кабан";
  return "drysh prime активирован";
}

export function stressEmoji(value: number): string {
  if (value <= 2) return "🧘";
  if (value <= 4) return "😌";
  if (value <= 6) return "😬";
  if (value <= 8) return "😤";
  return "🤯";
}

export function stressGradient(value: number): string {
  const stops = [
    "#22c55e",
    "#4ade80",
    "#a3e635",
    "#facc15",
    "#fb923c",
    "#f97316",
    "#ef4444",
    "#dc2626",
    "#b91c1c",
    "#7f1d1d",
  ];
  const index = Math.min(Math.max(value - 1, 0), stops.length - 1);
  const next = Math.min(index + 1, stops.length - 1);
  return `${stops[index]}, ${stops[next]}`;
}

export function stressHint(value: number): string {
  if (value <= 3) return "чилл, не ноешь";
  if (value <= 6) return "рабочий день detected";
  if (value <= 8) return "созвоны жрут душу";
  return "аврал, беги в зал или спи";
}
