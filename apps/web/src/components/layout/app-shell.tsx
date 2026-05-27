import { Link, useRouterState } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { useMessages } from "@/features/i18n/use-messages";
import { signOut } from "@/features/auth/auth-actions";
import { useAuth } from "@/features/auth/auth-provider";

const navItems = [
  { to: "/dashboard", key: "dashboard" as const },
  { to: "/dashboard/training", key: "training" as const },
  { to: "/dashboard/nutrition", key: "nutrition" as const },
  { to: "/dashboard/progress", key: "progress" as const },
] as const;

export const AppShell = ({ children }: PropsWithChildren) => {
  const t = useMessages();
  const { session } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl gap-6 p-4 text-zinc-100 md:p-6">
      <aside className="hidden w-56 shrink-0 flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 md:flex">
        <div>
          <p className="text-xl font-bold">Gymek</p>
          <p className="text-xs text-zinc-500">{session?.user.email}</p>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-white text-black" : "text-zinc-300 hover:bg-zinc-900"
                }`}
                to={item.to}
              >
                {t.nav[item.key]}
              </Link>
            );
          })}
        </nav>
        <button
          className="mt-auto rounded-lg border border-zinc-700 px-3 py-2 text-left text-sm"
          onClick={() => void signOut()}
          type="button"
        >
          {t.auth.signOut}
        </button>
      </aside>

      <main className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 pb-20 md:pb-6 md:p-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-zinc-800 bg-zinc-950 p-2 md:hidden">
        {navItems.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              className={`flex-1 rounded-lg py-2 text-center text-xs ${
                active ? "bg-white text-black" : "text-zinc-400"
              }`}
              to={item.to}
            >
              {t.nav[item.key]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
