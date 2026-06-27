import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/newsletter")({
  component: NewsletterLayout,
});

function NewsletterLayout() {
  return <Outlet />;
}
