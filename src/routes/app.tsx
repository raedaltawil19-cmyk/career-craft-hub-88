import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { WorkspaceProvider } from "@/lib/career-store";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Career workspace — Smart CV" },
      {
        name: "description",
        content: "Your Master CV, matched jobs, tailored applications and progress in one place.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <WorkspaceProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </WorkspaceProvider>
  );
}
