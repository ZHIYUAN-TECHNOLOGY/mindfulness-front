import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/admin/events/$id/registrations")({
  component: RegistrationsDashboard,
});

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  guests: number;
  message: string | null;
  status: string;
  paymentStatus: string;
  source: string;
  createdAt: string;
}

interface Summary {
  registeredCount: number;
  guestCount: number;
  cancelledCount: number;
  paidCount: number;
}

function RegistrationsDashboard() {
  const { id } = Route.useParams();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(1);
  const [addPaymentStatus, setAddPaymentStatus] = useState<"none" | "unpaid" | "paid">("none");
  const [adding, setAdding] = useState(false);

  const load = () => {
    apiFetch(`/api/events/${id}/registrations`)
      .then((data) => {
        setRegistrations(data.registrations || []);
        setSummary(data.summary || null);
      })
      .catch((err) => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const markPaid = async (regId: string) => {
    try {
      await apiFetch(`/api/events/registrations/${regId}`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus: "paid" }),
      });
      load();
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  const cancel = async (regId: string) => {
    if (!confirm("Cancel this registration?")) return;
    try {
      await apiFetch(`/api/events/registrations/${regId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });
      load();
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  const addRegistrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setAdding(true);
    try {
      await apiFetch(`/api/events/${id}/registrations`, {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          guests,
          paymentStatus: addPaymentStatus,
        }),
      });
      setName("");
      setEmail("");
      setPhone("");
      setGuests(1);
      setAddPaymentStatus("none");
      load();
    } catch (err: any) {
      alert(err.message || "Failed to add registrant");
    } finally {
      setAdding(false);
    }
  };

  const exportCsv = () => {
    const header = "Name,Email,Phone,Guests,Status,Payment,Source,Registered\n";
    const rows = registrations
      .map((r) =>
        [
          r.name,
          r.email,
          r.phone || "",
          r.guests,
          r.status,
          r.paymentStatus,
          r.source,
          new Date(r.createdAt).toISOString(),
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-${id}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/events" className="text-sm text-gold-primary hover:text-gold-light underline">
          ← Back to Events
        </Link>
        <span className="text-sm text-gold-pale font-medium border-b-2 border-gold-primary pb-0.5">
          Registrations
        </span>
      </div>

      {loading ? (
        <p className="text-sm opacity-70">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                ["Registered", summary.registeredCount],
                ["Total guests", summary.guestCount],
                ["Paid", summary.paidCount],
                ["Cancelled", summary.cancelledCount],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="bg-brown-dark/85 border border-gold-light/20 rounded-xl px-4 py-3"
                >
                  <div className="text-2xl font-bold text-gold-pale">{value}</div>
                  <div className="text-xs text-gold-light/70">{label}</div>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={addRegistrant}
            className="flex flex-wrap gap-2 items-end mb-6 bg-brown-dark/40 border border-gold-light/15 rounded-xl p-4"
          >
            <input
              className="px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale text-sm"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale text-sm"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale text-sm w-20"
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
            />
            <select
              className="px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale text-sm"
              value={addPaymentStatus}
              onChange={(e) =>
                setAddPaymentStatus(e.target.value as "none" | "unpaid" | "paid")
              }
            >
              <option value="none">No payment</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 rounded bg-gold-primary text-brown-dark font-semibold text-sm hover:bg-gold-light transition disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add registrant"}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="px-4 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
            >
              Export CSV
            </button>
          </form>

          {registrations.length === 0 ? (
            <p className="text-sm opacity-70">No registrations yet.</p>
          ) : (
            <div className="bg-brown-dark/85 border border-gold-light/20 rounded-xl overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-gold-light/10 text-gold-light/70">
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Contact</th>
                    <th className="text-left px-4 py-3 font-medium">Guests</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Payment</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gold-pale">
                  {registrations.map((r) => (
                    <tr key={r.id} className="border-b border-gold-light/10">
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.name}</div>
                        {r.message && (
                          <div className="text-xs text-gold-light/60 mt-0.5">{r.message}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gold-light/70">
                        <div>{r.email}</div>
                        {r.phone && <div className="text-xs">{r.phone}</div>}
                      </td>
                      <td className="px-4 py-3">{r.guests}</td>
                      <td className="px-4 py-3">{r.status}</td>
                      <td className="px-4 py-3">{r.paymentStatus}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {r.paymentStatus === "unpaid" && r.status !== "cancelled" && (
                            <button
                              onClick={() => markPaid(r.id)}
                              className="text-green-300 hover:text-green-200 text-xs underline"
                            >
                              Mark Paid
                            </button>
                          )}
                          {r.status !== "cancelled" && (
                            <button
                              onClick={() => cancel(r.id)}
                              className="text-red-400 hover:text-red-300 text-xs underline"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
