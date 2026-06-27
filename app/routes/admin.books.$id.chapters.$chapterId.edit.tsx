import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { BlockEditor, Block } from "../components/BlockEditor";

export const Route = createFileRoute("/admin/books/$id/chapters/$chapterId/edit")({
  component: EditChapterPage,
});

interface Chapter {
  id: string;
  bookId: string;
  title: string;
  slug: string;
  accessLevel: string;
  sortOrder: number;
  blocks: Block[];
}

function EditChapterPage() {
  const { id, chapterId } = Route.useParams();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [accessLevel, setAccessLevel] = useState<"free" | "member">("free");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!chapterId) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch(`/api/books/chapters/${chapterId}`);
        if (!cancelled) {
          const ch = data.chapter as Chapter;
          setChapter(ch);
          setTitle(ch.title);
          setSlug(ch.slug);
          setAccessLevel(ch.accessLevel as "free" | "member");
          setBlocks(ch.blocks || []);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  const handleSave = async () => {
    if (!title.trim()) return setError("Title is required");
    if (!slug.trim()) return setError("Slug is required");
    setSaving(true);
    setError("");
    setSavedMessage("");
    try {
      const data = await apiFetch(`/api/books/chapters/${chapterId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          accessLevel,
          blocks,
        }),
      });
      setChapter(data.chapter);
      setSavedMessage("Chapter saved successfully.");
      setSaving(false);
    } catch (err: any) {
      setError(err.message || "Failed to save chapter");
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm opacity-70">Loading...</p>;
  }

  if (!chapter) {
    return <p className="text-sm opacity-70">Chapter not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gold-pale">Edit Chapter</h1>
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/books/${id}/chapters` as any}
            className="text-sm text-gold-primary hover:text-gold-light underline"
          >
            Back to Chapters
          </Link>
          <a
            href={`/books/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
          >
            Preview
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Chapter Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (savedMessage) setSavedMessage("");
            }}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              if (savedMessage) setSavedMessage("");
            }}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Access Level</label>
          <select
            value={accessLevel}
            onChange={(e) => {
              setAccessLevel(e.target.value as "free" | "member");
              if (savedMessage) setSavedMessage("");
            }}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
          >
            <option value="free">Free</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Content Blocks</label>
        <div className="bg-brown-dark/85 border border-gold-light/20 rounded-xl p-4 shadow-xl">
          <BlockEditor
            blocks={blocks}
            onChange={(nextBlocks) => {
              setBlocks(nextBlocks);
              if (savedMessage) setSavedMessage("");
            }}
          />
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      {savedMessage && <p className="mb-4 text-sm text-green-300 font-medium">{savedMessage}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded bg-gold-primary text-brown-dark font-semibold hover:bg-gold-light transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
