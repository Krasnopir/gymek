import { Link, useRouterState } from "@tanstack/react-router";
import {
  Dumbbell,
  Home,
  LineChart,
  LogOut,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, type PropsWithChildren } from "react";
import { useMessages } from "@/features/i18n/use-messages";
import { useAppToast } from "@/features/toast/use-app-toast";
import { signOut } from "@/features/auth/auth-actions";
import { useAuth } from "@/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { isNavActive } from "@/lib/nav";

const navItems: Array<{
  to: string;
  key: "dashboard" | "training" | "nutrition" | "progress" | "settings";
  icon: LucideIcon;
  mobileLabel?: boolean;
}> = [
  { to: "/dashboard", key: "dashboard", icon: Home },
  { to: "/dashboard/training", key: "training", icon: Dumbbell },
  { to: "/dashboard/nutrition", key: "nutrition", icon: UtensilsCrossed },
  { to: "/dashboard/progress", key: "progress", icon: LineChart },
  { to: "/dashboard/settings", key: "settings", icon: Settings },
];

export const AppShell = ({ children }: PropsWithChildren) => {
  const t = useMessages();
  const toast = useAppToast();
  const { session } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success(t.toast.signedOut);
    } catch (error) {
      toast.error(error);
      setSigningOut(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl gap-6 p-4 text-zinc-900 md:p-6 dark:text-zinc-100">
      <aside className="hidden w-56 shrink-0 flex-col gap-4 rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-4 shadow-sm md:flex dark:border-zinc-800 dark:from-zinc-900/80 dark:to-zinc-950 dark:shadow-none">
        <div>
          <p className="flex items-center gap-2 text-xl font-bold">
            <span className="text-lg">🧌</span> Gymek
          </p>
          <p className="mt-1 truncate text-xs text-zinc-500">{session?.user.email}</p>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-gradient-to-r from-violet-600 to-violet-500 font-medium text-white shadow dark:from-white dark:to-zinc-200 dark:text-black"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-white"
                }`}
                to={item.to}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
                {t.nav[item.key]}
              </Link>
            );
          })}
        </nav>
        <Button
          className="mt-auto w-full justify-start"
          icon={LogOut}
          loading={signingOut}
          loadingLabel={t.common.loading}
          onClick={() => void handleSignOut()}
          variant="ghost"
        >
          {t.auth.signOut}
        </Button>
      </aside>

      <main className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white/80 p-4 pb-24 shadow-sm md:pb-6 md:p-6 dark:border-zinc-800 dark:bg-zinc-950/90 dark:shadow-none">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200/90 bg-white/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-950/95 md:hidden">
        <div className="mx-auto flex max-w-lg justify-around gap-0.5">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                aria-current={active ? "page" : undefined}
                aria-label={t.nav[item.key]}
                className={`flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 transition ${
                  active
                    ? "bg-gradient-to-t from-violet-100 to-violet-50 text-violet-700 dark:from-violet-600/30 dark:to-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200"
                }`}
                to={item.to}
              >
                <Icon
                  className={`h-5 w-5 ${active ? "text-violet-600 dark:text-violet-300" : ""}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={`max-w-full truncate text-[9px] leading-tight ${
                    active ? "font-medium text-violet-700 dark:text-violet-200" : ""
                  }`}
                >
                  {t.nav[item.key]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
