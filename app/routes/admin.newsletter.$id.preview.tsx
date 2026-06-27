import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/admin/newsletter/$id/preview")({
  component: NewsletterPreviewPage,
});

function NewsletterPreviewPage() {
  const { id } = Route.useParams();
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/newsletter/${id}/preview`)
      .then((data) => {
        setHtml(data.html || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Preview failed");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="text-sm opacity-70">Loading preview...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-300">{error}</p>;
  }

  return (
    <div className="h-[calc(100vh_-_140px)]">
      <h2 className="text-lg font-bold mb-3">Email Preview</h2>
      <iframe
        title="Email Preview"
        srcDoc={html}
        className="w-full h-full rounded-lg border border-gold-light/20 bg-white"
        sandbox="allow-same-origin"
      />
    </div>
  );
}
