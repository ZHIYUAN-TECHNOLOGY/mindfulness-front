import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminLayout } from "../components/AdminLayout";
import { getMe } from "../lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    // Both of these run while the user is intentionally logged out:
    // /admin/login requests the magic link; /admin/verify consumes its token.
    if (location.pathname === "/admin/login" || location.pathname === "/admin/verify") return;
    const user = await getMe();
    if (!user || user.role !== "admin") {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminComponent,
});

function AdminComponent() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
