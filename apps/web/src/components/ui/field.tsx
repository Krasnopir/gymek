import { cn } from "@/lib/cn";

export const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600";

export const textareaClassName = cn(inputClassName, "resize-y min-h-[5rem]");

export const selectClassName = cn(
  inputClassName,
  "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
);
