import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/admin/events")({
  component: EventsListPage,
});

interface EventItem {
  id: string;
  title: string;
  eventDate: string;
  location: string | null;
  status: string;
  isActive: boolean;
  updatedAt: string;
}

function EventsListPage() {
  const { pathname } = useLocation();
  const isIndexPage = pathname === "/admin/events" || pathname === "/admin/events/";

  if (!isIndexPage) {
    return <Outlet />;
  }

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/events")
      .then((data) => {
        setEvents(data.events || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await apiFetch(`/api/events/${id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Failed to delete event.");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gold-pale">Events</h1>
        <Link
          to={"/admin/events/create" as any}
          className="px-4 py-2 rounded bg-gold-primary text-brown-dark font-semibold text-sm hover:bg-gold-light transition"
        >
          New Event
        </Link>
      </div>

      {loading ? (
        <p className="text-sm opacity-70">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-sm opacity-70">No events created yet.</p>
      ) : (
        <div className="bg-brown-dark/85 border border-gold-light/20 rounded-xl overflow-x-auto shadow-xl">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gold-light/10 text-gold-light/70">
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Active</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gold-pale">
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gold-light/10 hover:bg-gold-primary/10 transition">
                  <td className="px-4 py-3 font-medium">{event.title}</td>
                  <td className="px-4 py-3 text-gold-light/70">{formatDate(event.eventDate)}</td>
                  <td className="px-4 py-3 text-gold-light/70">{event.location || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        event.status === "upcoming"
                          ? "bg-yellow-900/30 text-yellow-300"
                          : "bg-brown-dark/60 text-gold-light/70 border border-gold-light/20"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        event.isActive
                          ? "bg-green-900/30 text-green-300"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {event.isActive ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/events/${event.id}/registrations` as any}
                        className="text-gold-light hover:text-gold-pale transition text-xs font-medium underline"
                      >
                        Registrations
                      </Link>
                      <Link
                        to={`/admin/events/${event.id}` as any}
                        className="text-gold-primary hover:text-gold-light transition text-xs font-medium underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-400 hover:text-red-300 transition text-xs font-medium underline"
                      >
                        Delete
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
