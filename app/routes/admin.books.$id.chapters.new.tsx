import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/admin/books/$id/chapters/new")({
  component: NewChapterPage,
});

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function NewChapterPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [accessLevel, setAccessLevel] = useState<"free" | "member">("free");
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

  const handleSubmit = async () => {
    if (!title.trim()) return setError("Title is required");
    if (!slug.trim()) return setError("Slug is required");
    setSaving(true);
    setError("");
    try {
      const data = await apiFetch(`/api/books/${id}/chapters`, {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          accessLevel,
        }),
      });
      navigate({ to: `/admin/books/${id}/chapters/${data.chapter.id}/edit` as any });
    } catch (err: any) {
      setError(err.message || "Failed to create chapter");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Chapter</h1>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
            placeholder="Chapter title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
            placeholder="chapter-slug"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Access Level</label>
          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value as "free" | "member")}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
          >
            <option value="free">Free</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2 rounded bg-gold-primary text-brown-dark font-semibold hover:bg-gold-light transition disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Chapter"}
        </button>
      </div>
    </div>
  );
}
