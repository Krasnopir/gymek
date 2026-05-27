import { useToastStore } from "./toast-store";

const typeStyles = {
  success: "border-emerald-700/60 bg-emerald-950/90 text-emerald-100",
  error: "border-red-700/60 bg-red-950/90 text-red-100",
  info: "border-zinc-600 bg-zinc-900/95 text-zinc-100",
};

export const Toaster = () => {
  const items = useToastStore((state) => state.items);
  const dismiss = useToastStore((state) => state.dismiss);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 right-3 z-[100] flex w-[min(100vw-1.5rem,24rem)] flex-col gap-2 md:bottom-4"
    >
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${typeStyles[toast.type]}`}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="leading-snug">{toast.message}</p>
            <button
              aria-label="Close"
              className="shrink-0 cursor-pointer rounded px-1 text-xs opacity-70 transition hover:bg-white/10 hover:opacity-100"
              onClick={() => dismiss(toast.id)}
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
