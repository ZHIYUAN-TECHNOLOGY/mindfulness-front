import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { MediaPickerModal } from "../components/MediaPickerModal";
import { EventVideoEditor } from "../components/EventVideoEditor";
import { BlockEditor, type Block } from "../components/BlockEditor";
import { RichTextArea } from "../components/RichTextArea";

export const Route = createFileRoute("/admin/events/$id")({
  component: EditEventRoute,
});

// `/admin/events/$id/registrations` is a child route of this `/admin/events/$id`
// route. When the path is deeper than this route (a child), render the child via
// <Outlet/> instead of the edit form.
function EditEventRoute() {
  const { id } = Route.useParams();
  const { pathname } = useLocation();
  const base = `/admin/events/${id}`;
  if (pathname !== base && pathname !== `${base}/`) {
    return <Outlet />;
  }
  return <EditEventPage />;
}

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string | null;
  imageUrl: string | null;
  headerImageUrl: string | null;
  recordingLibraryImageUrl: string | null;
  status: string;
  isActive: boolean;
  longDescription: string | null;
  paymentMode: "free" | "self_collect" | "online";
  price: number | null;
  regularPrice: number | null;
  earlyBirdPrice: number | null;
  earlyBirdMode: "disabled" | "days_before_event" | "fixed_date";
  earlyBirdDaysBefore: number;
  earlyBirdUntil: string | null;
  stripeProductId: string | null;
  currency: string;
  capacity: number | null;
  registrationOpen: boolean;
  series: string | null;
  blocks: Block[];
}

function EditEventPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [recordingLibraryImageUrl, setRecordingLibraryImageUrl] = useState("");
  const [status, setStatus] = useState<"upcoming" | "past">("upcoming");
  const [isActive, setIsActive] = useState(true);
  const [paymentMode, setPaymentMode] = useState<"free" | "self_collect" | "online">("free");
  const [price, setPrice] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [earlyBirdPrice, setEarlyBirdPrice] = useState("");
  const [earlyBirdMode, setEarlyBirdMode] = useState<"disabled" | "days_before_event" | "fixed_date">("disabled");
  const [earlyBirdDaysBefore, setEarlyBirdDaysBefore] = useState("30");
  const [earlyBirdUntil, setEarlyBirdUntil] = useState("");
  const [currency, setCurrency] = useState("MYR");
  const [capacity, setCapacity] = useState("");
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [series, setSeries] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pickerTarget, setPickerTarget] = useState<"cover" | "header" | "recording" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    apiFetch("/api/events")
      .then((data) => {
        const found = (data.events || []).find((e: EventItem) => e.id === id);
        if (found) {
          setEvent(found);
          setTitle(found.title);
          setDescription(found.description || "");
          // Format datetime-local value (YYYY-MM-DDTHH:mm)
          const d = new Date(found.eventDate);
          const pad = (n: number) => n.toString().padStart(2, "0");
          setEventDate(
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
          );
          setLocation(found.location || "");
          setImageUrl(found.imageUrl || "");
          setHeaderImageUrl(found.headerImageUrl || "");
          setRecordingLibraryImageUrl(found.recordingLibraryImageUrl || "");
          setStatus(found.status as "upcoming" | "past");
          setIsActive(found.isActive);
          setPaymentMode(found.paymentMode || "free");
          setPrice(found.price != null ? (found.price / 100).toString() : "");
          setRegularPrice(
            found.regularPrice != null ? (found.regularPrice / 100).toString() : ""
          );
          setEarlyBirdPrice(
            found.earlyBirdPrice != null ? (found.earlyBirdPrice / 100).toString() : ""
          );
          setEarlyBirdMode(found.earlyBirdMode || "disabled");
          setEarlyBirdDaysBefore(String(found.earlyBirdDaysBefore ?? 30));
          setEarlyBirdUntil(
            found.earlyBirdUntil
              ? new Date(found.earlyBirdUntil).toISOString().slice(0, 16)
              : ""
          );
          setCurrency(found.currency || "MYR");
          setCapacity(found.capacity != null ? String(found.capacity) : "");
          setRegistrationOpen(found.registrationOpen ?? true);
          setSeries(found.series || "");
          setBlocks((found.blocks as Block[]) || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelectMedia = (_id: string, url: string) => {
    if (pickerTarget === "header") setHeaderImageUrl(url);
    else if (pickerTarget === "recording") setRecordingLibraryImageUrl(url);
    else setImageUrl(url);
    setPickerTarget(null);
  };

  const handleUpdate = async () => {
    if (!title.trim()) return setError("Title is required");
    if (!eventDate.trim()) return setError("Event date is required");
    setSaving(true);
    setError("");
    try {
      const data = await apiFetch(`/api/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          eventDate: new Date(eventDate).toISOString(),
          location: location.trim() || null,
          imageUrl: imageUrl || null,
          headerImageUrl: headerImageUrl || null,
          recordingLibraryImageUrl: recordingLibraryImageUrl || null,
          status,
          isActive,
          paymentMode,
          price: paymentMode === "free" || !price.trim() ? null : Math.round(Number(price) * 100),
          regularPrice:
            paymentMode === "free" || !regularPrice.trim()
              ? null
              : Math.round(Number(regularPrice) * 100),
          earlyBirdPrice:
            paymentMode === "free" || !earlyBirdPrice.trim()
              ? null
              : Math.round(Number(earlyBirdPrice) * 100),
          earlyBirdMode,
          earlyBirdDaysBefore: Number(earlyBirdDaysBefore) || 30,
          earlyBirdUntil: earlyBirdMode === "fixed_date" && earlyBirdUntil.trim()
            ? new Date(earlyBirdUntil).toISOString()
            : null,
          currency: currency.trim() || "MYR",
          capacity: capacity.trim() ? Number(capacity) : null,
          registrationOpen,
          series: series.trim() || null,
          blocks,
        }),
      });
      setEvent(data.event);
    } catch (err: any) {
      setError(err.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await apiFetch(`/api/events/${id}`, { method: "DELETE" });
      navigate({ to: "/admin/events" as any });
    } catch (err: any) {
      alert(err.message || "Failed to delete event");
    }
  };

  if (loading) {
    return <p className="text-sm opacity-70">Loading...</p>;
  }

  if (!event) {
    return <p className="text-sm opacity-70">Event not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/events"
          className="text-sm text-gold-primary hover:text-gold-light underline"
        >
          ← Back to Events
        </Link>
        <span className="text-sm text-gold-pale font-medium border-b-2 border-gold-primary pb-0.5">Edit Event</span>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <RichTextArea
            value={description}
            onChange={setDescription}
            rows={4}
            placeholder="Enter event description..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Date *</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
              placeholder="City, Venue, or Online"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Cover Image{" "}
            <span className="text-gold-light/60 font-normal">— shown on event cards / listing</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPickerTarget("cover")}
              className="px-4 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
            >
              {imageUrl ? "Change Image" : "Select Image"}
            </button>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Cover preview"
                className="h-16 w-auto rounded border border-gold-light/20 object-cover"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Header Image{" "}
            <span className="text-gold-light/60 font-normal">— full-width banner on the detail page</span>
          </label>
          <input
            type="text"
            value={headerImageUrl}
            onChange={(e) => setHeaderImageUrl(e.target.value)}
            placeholder="Paste an image URL, or pick from media"
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
          />
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={() => setPickerTarget("header")}
              className="px-4 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
            >
              Pick from Media
            </button>
            {headerImageUrl && (
              <img
                src={headerImageUrl}
                alt="Header preview"
                className="h-16 w-auto rounded border border-gold-light/20 object-cover"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Recording Library Image{" "}
            <span className="text-gold-light/60 font-normal">— shown on the detail page when the event has passed</span>
          </label>
          <input
            type="text"
            value={recordingLibraryImageUrl}
            onChange={(e) => setRecordingLibraryImageUrl(e.target.value)}
            placeholder="Paste an image URL, or pick from media"
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
          />
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={() => setPickerTarget("recording")}
              className="px-4 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
            >
              Pick from Media
            </button>
            {recordingLibraryImageUrl && (
              <img
                src={recordingLibraryImageUrl}
                alt="Recording library preview"
                className="h-16 w-auto rounded border border-gold-light/20 object-cover"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "upcoming" | "past")}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Series</label>
            <select
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
            >
              <option value="">None</option>
              <option value="apcomm">APCOMM</option>
              <option value="apcod">APCOD</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-gold-primary w-4 h-4"
          />
          <label htmlFor="isActive" className="text-sm">Active (visible on public page)</label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Page Blocks (detail page)</label>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>

        <div className="border-t border-gold-light/10 pt-4">
          <label className="block text-sm font-medium mb-3">Members-only Videos</label>
          <EventVideoEditor eventId={id} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as typeof paymentMode)}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
            >
              <option value="free">Free</option>
              <option value="self_collect">Self-collect (paid offline)</option>
              <option value="online">Online payment (Stripe)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capacity (blank = unlimited)</label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
              placeholder="Unlimited"
            />
          </div>
        </div>

        {paymentMode !== "free" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Regular Price (per seat)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Early-bird Price (per seat)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={earlyBirdPrice}
                  onChange={(e) => setEarlyBirdPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Early-bird Mode</label>
              <select
                value={earlyBirdMode}
                onChange={(e) => setEarlyBirdMode(e.target.value as typeof earlyBirdMode)}
                className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
              >
                <option value="disabled">No early-bird</option>
                <option value="days_before_event">X days before event</option>
                <option value="fixed_date">Fixed deadline</option>
              </select>
            </div>

            {earlyBirdMode === "days_before_event" && (
              <div>
                <label className="block text-sm font-medium mb-1">Days before event</label>
                <input
                  type="number"
                  min={1}
                  value={earlyBirdDaysBefore}
                  onChange={(e) => setEarlyBirdDaysBefore(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
                  placeholder="30"
                />
              </div>
            )}

            {earlyBirdMode === "fixed_date" && (
              <div>
                <label className="block text-sm font-medium mb-1">Early-bird Deadline</label>
                <input
                  type="datetime-local"
                  value={earlyBirdUntil}
                  onChange={(e) => setEarlyBirdUntil(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Legacy Price</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
                  placeholder="Fallback if regular price is empty"
                />
                <p className="text-xs text-gold-light/70 mt-1">Used only when regular price is blank. Prefer regular price.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            id="registrationOpen"
            type="checkbox"
            checked={registrationOpen}
            onChange={(e) => setRegistrationOpen(e.target.checked)}
            className="accent-gold-primary w-4 h-4"
          />
          <label htmlFor="registrationOpen" className="text-sm">
            Registration open
          </label>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={saving}
          className="px-5 py-2 rounded bg-gold-primary text-brown-dark font-semibold hover:bg-gold-light transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-5 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>

      {pickerTarget && (
        <MediaPickerModal
          onSelect={handleSelectMedia}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
}
