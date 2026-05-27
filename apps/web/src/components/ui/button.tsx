import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 enabled:cursor-pointer active:enabled:scale-[0.98] dark:focus-visible:ring-offset-zinc-950";

export const buttonVariants = {
  primary:
    "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100",
  gradientOrange:
    "bg-gradient-to-r from-orange-500 to-amber-500 font-semibold text-black shadow-sm shadow-orange-950/20 hover:from-orange-400 hover:to-amber-400",
  gradientEmerald:
    "bg-gradient-to-r from-emerald-500 to-green-400 font-semibold text-black shadow-sm hover:from-emerald-400 hover:to-green-300",
  gradientLime:
    "bg-gradient-to-r from-lime-400 to-emerald-400 font-semibold text-black shadow-sm hover:from-lime-300 hover:to-emerald-300",
  gradientCyan:
    "bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-black shadow-sm hover:from-cyan-400 hover:to-blue-400",
  outline:
    "border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/80",
  softLime:
    "border border-lime-300 bg-lime-50 text-lime-800 hover:border-lime-400 hover:bg-lime-100 dark:border-lime-800/50 dark:bg-lime-950/30 dark:text-lime-200 dark:hover:border-lime-600/60 dark:hover:bg-lime-950/50",
  softCyan:
    "border border-cyan-300 bg-cyan-50 text-cyan-800 hover:border-cyan-400 hover:bg-cyan-100 dark:border-cyan-800/50 dark:bg-cyan-950/30 dark:text-cyan-200 dark:hover:border-cyan-600/60 dark:hover:bg-cyan-950/50",
  softViolet:
    "border border-violet-300 bg-violet-50 text-violet-800 hover:border-violet-400 hover:bg-violet-100 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-200 dark:hover:border-violet-600/60 dark:hover:bg-violet-950/60",
  danger:
    "border border-transparent bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300",
  ghost:
    "border border-transparent bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200",
} as const;

const sizeStyles = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof sizeStyles;

export function linkButtonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(baseStyles, buttonVariants[variant], sizeStyles[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  icon?: LucideIcon;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel,
  icon: Icon,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      aria-busy={loading || undefined}
      className={cn(baseStyles, buttonVariants[variant], sizeStyles[size], className)}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {loading ? (
        <Loader2 aria-hidden className="h-4 w-4 shrink-0 animate-spin" />
      ) : Icon ? (
        <Icon aria-hidden className="h-4 w-4 shrink-0" />
      ) : null}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
