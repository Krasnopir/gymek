import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type StatAccent = "blue" | "orange" | "emerald" | "indigo";

const accentStyles: Record<StatAccent, string> = {
  blue: "from-blue-50 to-sky-50 border-blue-100 dark:from-blue-500/15 dark:to-zinc-900/40 dark:border-zinc-800",
  orange:
    "from-orange-50 to-amber-50 border-orange-100 dark:from-orange-500/15 dark:to-zinc-900/40 dark:border-zinc-800",
  emerald:
    "from-emerald-50 to-green-50 border-emerald-100 dark:from-emerald-500/15 dark:to-zinc-900/40 dark:border-zinc-800",
  indigo:
    "from-indigo-50 to-violet-50 border-indigo-100 dark:from-indigo-500/15 dark:to-zinc-900/40 dark:border-zinc-800",
};

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: StatAccent;
};

export function StatCard({ label, value, icon: Icon, accent = "blue" }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br p-3 shadow-sm dark:shadow-none",
        accentStyles[accent],
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-500">{label}</p>
        <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-400" strokeWidth={1.75} />
      </div>
      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}
