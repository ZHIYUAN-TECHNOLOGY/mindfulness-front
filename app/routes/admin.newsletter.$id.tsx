import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/admin/newsletter/$id")({
  component: NewsletterDetailPage,
});

interface Newsletter {
  id: string;
  subject: string;
  preheader: string | null;
  blocks: unknown[];
  status: string;
  templateKey: string;
  templateOptions: Record<string, unknown>;
  customHtml: string | null;
  sentAt: string | null;
  createdAt: string;
}

const TEMPLATE_NAMES: Record<string, string> = {
  editorial: "The Editorial Letter",
  "mindful-note": "The Mindful Note",
  "weekly-digest": "The Weekly Digest",
  announcement: "The Announcement",
  custom: "Custom HTML",
};

function NewsletterDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/newsletter/${id}`)
      .then((data) => {
        setNewsletter(data.newsletter);
        setAnalytics(data.analytics || {});
      })
      .catch(() => {});
    apiFetch(`/api/newsletter/${id}/preview`)
      .then((data) => setPreviewHtml(data.html || ""))
      .catch(() => {});
  }, [id]);

  const handleSend = async () => {
    if (!confirm("Send this newsletter to all active subscribers?")) return;
    setSending(true);
    try {
      await apiFetch(`/api/newsletter/${id}/send`, { method: "POST" });
      const data = await apiFetch(`/api/newsletter/${id}`);
      setNewsletter(data.newsletter);
      setAnalytics(data.analytics || {});
    } catch (err: any) {
      alert(err.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!newsletter) return;
    if (!confirm(`Delete "${newsletter.subject}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/newsletter/${id}`, { method: "DELETE" });
      navigate({ to: "/admin/newsletter" });
    } catch (err: any) {
      alert(err.message || "Delete failed");
      setDeleting(false);
    }
  };

  if (!newsletter) {
    return <p className="text-sm opacity-70">Loading...</p>;
  }

  const totalSent = analytics.sent || 0;
  const delivered = analytics.delivered || 0;
  const opened = analytics.opened || 0;
  const clicked = analytics.clicked || 0;
  const bounced = analytics.bounced || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{newsletter.subject}</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/newsletter"
            className="text-sm text-gold-primary hover:text-gold-light underline"
          >
            Back
          </Link>
          {newsletter.status === "draft" && (
            <>
              <Link
                to={`/admin/newsletter/${id}/edit` as any}
                className="px-3 py-1.5 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
              >
                Edit
              </Link>
              <Link
                to={`/admin/newsletter/${id}/preview` as any}
                className="px-3 py-1.5 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
              >
                Preview
              </Link>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-1.5 rounded bg-gold-primary text-brown-dark font-semibold text-sm hover:bg-gold-light transition disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Now"}
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 rounded border border-red-400/30 text-red-300 text-sm hover:bg-red-900/20 transition disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <div className="bg-brown-dark rounded-lg p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-gold-light mb-1">Status</p>
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                newsletter.status === "sent"
                  ? "bg-green-900/50 text-green-300"
                  : newsletter.status === "sending"
                  ? "bg-yellow-900/50 text-yellow-300"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {newsletter.status}
            </span>
          </div>
          <div>
            <p className="text-gold-light mb-1">Template</p>
            <p className="text-gold-pale">{TEMPLATE_NAMES[newsletter.templateKey] || newsletter.templateKey}</p>
          </div>
          <div>
            <p className="text-gold-light mb-1">Created</p>
            <p className="text-gold-pale">{new Date(newsletter.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gold-light mb-1">Sent At</p>
            <p className="text-gold-pale">{newsletter.sentAt ? new Date(newsletter.sentAt).toLocaleDateString() : "-"}</p>
          </div>
          <div>
            <p className="text-gold-light mb-1">Preheader</p>
            <p className="text-gold-pale truncate">{newsletter.preheader || "-"}</p>
          </div>
        </div>
      </div>

      {newsletter.status === "sent" && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <div className="bg-brown-dark p-4 rounded-lg text-center">
            <p className="text-xs text-gold-light mb-1">Sent</p>
            <p className="text-2xl font-bold text-gold-pale">{totalSent}</p>
          </div>
          <div className="bg-brown-dark p-4 rounded-lg text-center">
            <p className="text-xs text-gold-light mb-1">Delivered</p>
            <p className="text-2xl font-bold text-gold-pale">{delivered}</p>
          </div>
          <div className="bg-brown-dark p-4 rounded-lg text-center">
            <p className="text-xs text-gold-light mb-1">Opened</p>
            <p className="text-2xl font-bold text-gold-pale">{opened}</p>
          </div>
          <div className="bg-brown-dark p-4 rounded-lg text-center">
            <p className="text-xs text-gold-light mb-1">Clicked</p>
            <p className="text-2xl font-bold text-gold-pale">{clicked}</p>
          </div>
          <div className="bg-brown-dark p-4 rounded-lg text-center">
            <p className="text-xs text-gold-light mb-1">Bounced</p>
            <p className="text-2xl font-bold text-gold-pale">{bounced}</p>
          </div>
        </div>
      )}

      <div className="bg-brown-dark rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Email Preview</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreviewExpanded((p) => !p)}
              className="text-xs text-gold-primary hover:text-gold-light underline"
            >
              {previewExpanded ? "Collapse" : "Expand"}
            </button>
            <Link
              to={`/admin/newsletter/${id}/preview` as any}
              className="text-xs text-gold-primary hover:text-gold-light underline"
            >
              Open full screen →
            </Link>
          </div>
        </div>
        {previewHtml ? (
          <iframe
            title="Newsletter preview"
            srcDoc={previewHtml}
            className={`w-full rounded-lg border border-gold-light/20 bg-white transition-all ${
              previewExpanded ? "h-[80vh]" : "h-[480px]"
            }`}
            sandbox="allow-same-origin"
          />
        ) : (
          <p className="text-sm text-gold-light/70 py-12 text-center">Loading preview...</p>
        )}
      </div>

      <div className="bg-brown-dark rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-3">Blocks ({newsletter.blocks.length})</h3>
        <div className="flex flex-col gap-2">
          {newsletter.blocks.map((block: any, i: number) => (
            <div key={i} className="text-sm text-gold-pale border border-gold-light/10 rounded p-3">
              <span className="text-xs font-semibold uppercase text-gold-light mr-2">{block.type}</span>
              {block.type === "text" && (
                <span className="opacity-80 truncate block">{block.content}</span>
              )}
              {block.type === "image" && (
                <span className="opacity-80 truncate block">{block.mediaId ? "Image selected" : "No image"}</span>
              )}
              {block.type === "button" && (
                <span className="opacity-80 truncate block">{block.text} → {block.url}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
