import { createFileRoute } from "@tanstack/react-router";
import { SettingsPanel } from "../components/SettingsPanel";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
        Site Settings
      </h1>
      <SettingsPanel />
    </div>
  );
}
