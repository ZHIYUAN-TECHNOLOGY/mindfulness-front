import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/admin/newsletter/")({
  component: NewsletterDashboard,
});

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: string;
  createdAt: string;
}

interface Newsletter {
  id: string;
  subject: string;
  preheader: string | null;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

function NewsletterDashboard() {
  const [subscribers, setSubscribers] = useState<{ subscribers: Subscriber[]; total: number; active: number; unsubscribed: number } | null>(null);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [subscriberQuery, setSubscriberQuery] = useState("");
  const [subscriberStatus, setSubscriberStatus] = useState<"all" | "active" | "unsubscribed">("all");

  useEffect(() => {
    apiFetch("/api/newsletter/subscribers")
      .then(setSubscribers)
      .catch(() => {});
    apiFetch("/api/newsletter")
      .then((data) => setNewsletters(data.newsletters || []))
      .catch(() => {});
  }, []);

  const handleDelete = async (nl: Newsletter) => {
    if (!confirm(`Delete "${nl.subject}"? This cannot be undone.`)) return;
    setDeletingId(nl.id);
    try {
      await apiFetch(`/api/newsletter/${nl.id}`, { method: "DELETE" });
      setNewsletters((prev) => prev.filter((n) => n.id !== nl.id));
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSubscribers = useMemo(() => {
    if (!subscribers) return [];
    const q = subscriberQuery.trim().toLowerCase();
    return subscribers.subscribers.filter((s) => {
      const matchesQuery =
        !q ||
        s.email.toLowerCase().includes(q) ||
        (s.name || "").toLowerCase().includes(q);
      const matchesStatus = subscriberStatus === "all" || s.status === subscriberStatus;
      return matchesQuery && matchesStatus;
    });
  }, [subscribers, subscriberQuery, subscriberStatus]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <Link
          to="/admin/newsletter/new"
          className="px-4 py-2 rounded bg-gold-primary text-brown-dark font-semibold text-sm hover:bg-gold-light transition"
        >
          Create Newsletter
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-brown-dark text-gold-pale p-5 rounded-lg">
          <p className="text-sm text-gold-light mb-1">Total Subscribers</p>
          <p className="text-3xl font-bold">{subscribers?.total ?? "-"}</p>
        </div>
        <div className="bg-brown-dark text-gold-pale p-5 rounded-lg">
          <p className="text-sm text-gold-light mb-1">Active</p>
          <p className="text-3xl font-bold">{subscribers?.active ?? "-"}</p>
        </div>
        <div className="bg-brown-dark text-gold-pale p-5 rounded-lg">
          <p className="text-sm text-gold-light mb-1">Unsubscribed</p>
          <p className="text-3xl font-bold">{subscribers?.unsubscribed ?? "-"}</p>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3">Subscribers</h2>
      <div className="bg-brown-dark rounded-lg overflow-hidden mb-8">
        <div className="p-4 border-b border-gold-light/10 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={subscriberQuery}
            onChange={(e) => setSubscriberQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-3 py-2.5 rounded-lg bg-brown-dark border border-gold-light/20 text-gold-pale text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/40 placeholder:text-gold-light/30"
          />
          <select
            value={subscriberStatus}
            onChange={(e) => setSubscriberStatus(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-lg bg-brown-dark border border-gold-light/20 text-gold-pale text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/40"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
          <div className="text-sm text-gold-light self-center">
            Showing {filteredSubscribers.length} / {subscribers?.total ?? 0}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gold-light/10 text-gold-light">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Subscribed</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-gold-pale">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gold-light/60">
                    No subscribers match your filters.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((s) => (
                  <tr key={s.id} className="border-b border-gold-light/10 hover:bg-gold-primary/10 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-primary/20 border border-gold-primary/30 flex items-center justify-center text-gold-primary font-bold text-xs">
                          {(s.name || s.email).charAt(0).toUpperCase()}
                        </div>
                        <span className={s.name ? "" : "text-gold-light/50 italic"}>
                          {s.name || "(no name)"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${s.email}`}
                        className="text-gold-primary hover:text-gold-light transition underline"
                      >
                        {s.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          s.status === "active"
                            ? "bg-green-900/50 text-green-300"
                            : "bg-gray-800 text-gray-300"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`mailto:${s.email}`}
                        className="inline-flex items-center gap-1.5 text-gold-primary hover:text-gold-light transition text-xs font-medium underline"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Reply
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3">Newsletters</h2>
      {newsletters.length === 0 ? (
        <p className="text-sm opacity-70">No newsletters yet.</p>
      ) : (
        <div className="bg-brown-dark rounded-lg overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gold-light/10 text-gold-light">
                <th className="text-left px-4 py-3 font-medium">Subject</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Sent At</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-gold-pale">
              {newsletters.map((nl) => (
                <tr key={nl.id} className="border-b border-gold-light/10 hover:bg-gold-primary/10 transition">
                  <td className="px-4 py-3">{nl.subject}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        nl.status === "sent"
                          ? "bg-green-900/50 text-green-300"
                          : nl.status === "sending"
                          ? "bg-yellow-900/50 text-yellow-300"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {nl.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{nl.sentAt ? new Date(nl.sentAt).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3">{new Date(nl.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-3">
                      <Link
                        to={`/admin/newsletter/${nl.id}` as any}
                        className="text-gold-primary hover:text-gold-light transition text-xs font-medium underline"
                      >
                        View
                      </Link>
                      {nl.status === "draft" && (
                        <Link
                          to={`/admin/newsletter/${nl.id}/edit` as any}
                          className="text-gold-primary hover:text-gold-light transition text-xs font-medium underline"
                        >
                          Edit
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(nl)}
                        disabled={deletingId === nl.id}
                        className="text-red-300 hover:text-red-200 transition text-xs font-medium underline disabled:opacity-50"
                      >
                        {deletingId === nl.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
