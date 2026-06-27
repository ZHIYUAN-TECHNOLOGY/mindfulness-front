import { createFileRoute } from "@tanstack/react-router";
import { MediaLibrary } from "../components/MediaLibrary";

export const Route = createFileRoute("/admin/media")({
  component: MediaComponent,
});

function MediaComponent() {
  return <MediaLibrary />;
}
