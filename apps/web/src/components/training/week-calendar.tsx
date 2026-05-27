import type { CalendarPlan } from "@/features/training/use-calendar-plans";

const statusColor: Record<string, string> = {
  completed: "bg-emerald-500",
  skipped: "bg-amber-500",
  planned: "bg-zinc-500",
};

type WeekCalendarProps = {
  plans: CalendarPlan[];
};

export const WeekCalendar = ({ plans }: WeekCalendarProps) => {
  const byDate = new Map(plans.map((plan) => [plan.plan_date, plan]));

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - 7 + index);
    return date.toISOString().slice(0, 10);
  });

  return (
    <div className="grid grid-cols-7 gap-1 sm:grid-cols-14">
      {days.map((date) => {
        const plan = byDate.get(date);
        const isToday = date === new Date().toISOString().slice(0, 10);
        return (
          <div
            key={date}
            className={`rounded-lg border p-2 text-center text-xs ${
              isToday ? "border-white" : "border-zinc-800"
            }`}
            title={plan?.focus ?? date}
          >
            <div className="text-zinc-500">{date.slice(5)}</div>
            <div
              className={`mx-auto mt-1 h-2 w-2 rounded-full ${
                plan ? statusColor[plan.status] ?? "bg-zinc-600" : "bg-zinc-800"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};
