import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { apiFetch, API_URL } from "../lib/api";
import { MediaPickerModal } from "../components/MediaPickerModal";

export const Route = createFileRoute("/admin/books/create")({
  component: NewBookPage,
});

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function NewBookPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug.trim()) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(generateSlug(value));
  };

  const handleSelectMedia = (id: string, url: string) => {
    setCoverMediaId(id);
    setCoverImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("Title is required");
    if (!slug.trim()) return setError("Slug is required");
    setSaving(true);
    setError("");
    try {
      const data = await apiFetch("/api/books", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          coverMediaId: coverMediaId || undefined,
          status,
        }),
      });
      navigate({ to: `/admin/books/${data.book.id}/chapters` as any });
    } catch (err: any) {
      setError(err.message || "Failed to create book");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Book</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
            placeholder="Book title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
            placeholder="book-slug"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
            placeholder="Short description..."
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

        {error && <p className="text-sm text-red-300">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded bg-gold-primary text-brown-dark font-semibold hover:bg-gold-light transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Book"}
          </button>
        </div>
      </form>

      {showMediaPicker && (
        <MediaPickerModal
          onSelect={handleSelectMedia}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
