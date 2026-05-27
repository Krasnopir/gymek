import type { CalendarPlan } from "@/features/training/use-calendar-plans";
import { cn } from "@/lib/cn";

const statusColor: Record<string, string> = {
  completed: "bg-emerald-500",
  skipped: "bg-amber-500",
  planned: "bg-zinc-400 dark:bg-zinc-500",
};

type WeekCalendarProps = {
  plans: CalendarPlan[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  legend: {
    completed: string;
    skipped: string;
    planned: string;
    empty: string;
  };
};

export const WeekCalendar = ({
  plans,
  selectedDate,
  onSelectDate,
  legend,
}: WeekCalendarProps) => {
  const byDate = new Map(plans.map((plan) => [plan.plan_date, plan]));

  const today = new Date().toISOString().slice(0, 10);

  /** Только прошлое + сегодня — без будущих дней. */
  const days = Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - index));
    return date.toISOString().slice(0, 10);
  });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 sm:grid-cols-14">
        {days.map((date) => {
          const plan = byDate.get(date);
          const isToday = date === today;
          const isSelected = date === selectedDate;
          const dotClass = plan
            ? statusColor[plan.status] ?? "bg-zinc-400"
            : "bg-zinc-200 dark:bg-zinc-800";

          return (
            <button
              key={date}
              className={cn(
                "cursor-pointer rounded-lg border p-2 text-center text-xs transition hover:ring-2 hover:ring-violet-400/40",
                isSelected && "ring-2 ring-violet-500",
                isToday
                  ? "border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-950/30"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40",
              )}
              onClick={() => onSelectDate(date)}
              title={plan?.focus ?? date}
              type="button"
            >
              <div className="text-zinc-500">{date.slice(5)}</div>
              <div className={cn("mx-auto mt-1 h-2 w-2 rounded-full", dotClass)} />
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {legend.completed}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {legend.skipped}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          {legend.planned}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          {legend.empty}
        </span>
      </div>
    </div>
  );
};
