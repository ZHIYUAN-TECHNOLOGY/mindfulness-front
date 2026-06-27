import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/books/$slug")({
  component: BookLayout,
});

function BookLayout() {
  return (
    <main className="pt-[120px] pb-[100px] min-h-[100dvh]">
      <Outlet />
    </main>
  );
}
