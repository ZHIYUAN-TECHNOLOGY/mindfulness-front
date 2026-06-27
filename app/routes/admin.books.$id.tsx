import { createFileRoute, Link, useNavigate, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, API_BASE_URL } from "../lib/api";
import { MediaPickerModal } from "../components/MediaPickerModal";

export const Route = createFileRoute("/admin/books/$id")({
  component: EditBookPage,
});

interface Book {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverMediaId: string | null;
  status: string;
}

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function useIsEditPath(): boolean {
  if (typeof window === "undefined") return true;
  const pathname = window.location.pathname;
  return /\/admin\/books\/[^/]+\/?$/.test(pathname);
}

function EditBookPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isEditPath = useIsEditPath();
  const [book, setBook] = useState<Book | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    apiFetch("/api/books")
      .then((data) => {
        const found = (data.books || []).find((b: Book) => b.id === id);
        if (found) {
          setBook(found);
          setTitle(found.title);
          setSlug(found.slug);
          setDescription(found.description || "");
          setCoverMediaId(found.coverMediaId);
          if (found.coverMediaId) {
            setCoverImageUrl(`${API_BASE_URL}/api/upload/media/${found.coverMediaId}/content`);
          }
          setStatus(found.status as "draft" | "published");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelectMedia = (mediaId: string, url: string) => {
    setCoverMediaId(mediaId);
    setCoverImageUrl(url);
  };

  const handleUpdate = async () => {
    if (!title.trim()) return setError("Title is required");
    if (!slug.trim()) return setError("Slug is required");
    setSaving(true);
    setError("");
    try {
      const data = await apiFetch(`/api/books/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          coverMediaId: coverMediaId || null,
          status,
        }),
      });
      setBook(data.book);
    } catch (err: any) {
      setError(err.message || "Failed to update book");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      await apiFetch(`/api/books/${id}`, { method: "DELETE" });
      navigate({ to: "/admin/books" as any });
    } catch (err: any) {
      alert(err.message || "Failed to delete book");
    }
  };

  if (loading) {
    return <p className="text-sm opacity-70">Loading...</p>;
  }

  if (!book) {
    return <p className="text-sm opacity-70">Book not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/books"
            className="text-sm text-gold-primary hover:text-gold-light underline"
          >
            ← Back to Books
          </Link>
          {isEditPath ? (
            <span className="text-sm text-gold-pale font-medium border-b-2 border-gold-primary pb-0.5">Edit Book</span>
          ) : (
            <Link
              to={`/admin/books/${id}` as any}
              className="text-sm text-gold-light hover:text-gold-pale transition"
            >
              Edit Book
            </Link>
          )}
          {isEditPath ? (
            <Link
              to={`/admin/books/${id}/chapters` as any}
              className="text-sm text-gold-light hover:text-gold-pale transition"
            >
              Chapters
            </Link>
          ) : (
            <span className="text-sm text-gold-pale font-medium border-b-2 border-gold-primary pb-0.5">Chapters</span>
          )}
        </div>
      </div>

      {isEditPath && (
        <>
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
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cover Image</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="px-4 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
                >
                  {coverMediaId ? "Change Cover" : "Select Cover"}
                </button>
                {coverImageUrl && (
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="h-16 w-auto rounded border border-gold-light/20 object-cover"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
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

          {showMediaPicker && (
            <MediaPickerModal
              onSelect={handleSelectMedia}
              onClose={() => setShowMediaPicker(false)}
            />
          )}
        </>
      )}

      {!isEditPath && <Outlet />}
    </div>
  );
}
