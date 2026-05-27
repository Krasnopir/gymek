import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/features/auth/auth-provider";

const DashboardLayout = () => {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") {
      return;
    }
  },
  component: DashboardGate,
});

function DashboardGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    throw redirect({ to: "/" });
  }

  return <DashboardLayout />;
}
