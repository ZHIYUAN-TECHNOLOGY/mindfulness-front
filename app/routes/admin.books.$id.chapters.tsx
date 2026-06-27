import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/admin/books/$id/chapters")({
  component: ChaptersListPage,
});

interface Book {
  id: string;
  title: string;
  slug: string;
}

interface Chapter {
  id: string;
  title: string;
  slug: string;
  accessLevel: string;
  sortOrder: number;
}

function ChaptersListPage() {
  const { pathname } = useLocation();
  const isIndexPage = /\/admin\/books\/[^/]+\/chapters\/?$/.test(pathname);

  if (!isIndexPage) {
    return <Outlet />;
  }

  const { id } = Route.useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch("/api/books");
        const found = (data.books || []).find((b: Book) => b.id === id);
        if (!found) {
          if (!cancelled) setLoading(false);
          return;
        }
        if (!cancelled) setBook(found);

        const detail = await apiFetch(`/api/books/${found.slug}`);
        if (!cancelled) {
          setChapters(detail.chapters || []);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load chapters.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async (chapterId: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    try {
      await apiFetch(`/api/books/chapters/${chapterId}`, { method: "DELETE" });
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    } catch {
      alert("Failed to delete chapter.");
    }
  };

  const handleReorder = async (chapterId: string, newOrder: number) => {
    try {
      await apiFetch(`/api/books/chapters/${chapterId}/reorder`, {
        method: "PATCH",
        body: JSON.stringify({ sortOrder: newOrder }),
      });
      // Refresh chapters after reorder
      if (book) {
        const detail = await apiFetch(`/api/books/${book.slug}`);
        setChapters(detail.chapters || []);
      }
    } catch {
      alert("Failed to reorder chapter.");
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const target = chapters[index];
    const above = chapters[index - 1];
    handleReorder(target.id, above.sortOrder);
  };

  const moveDown = (index: number) => {
    if (index === chapters.length - 1) return;
    const target = chapters[index];
    const below = chapters[index + 1];
    handleReorder(target.id, below.sortOrder);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gold-pale">
          {book ? `Chapters — ${book.title}` : "Chapters"}
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/books/${id}` as any}
            className="text-sm text-gold-primary hover:text-gold-light underline"
          >
            Back to Book
          </Link>
          <Link
            to={`/admin/books/${id}/chapters/new` as any}
            className="px-4 py-2 rounded bg-gold-primary text-brown-dark font-semibold text-sm hover:bg-gold-light transition"
          >
            New Chapter
          </Link>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-300">{error}</p>
      )}

      {loading ? (
        <p className="text-sm opacity-70">Loading...</p>
      ) : !book ? (
        <p className="text-sm opacity-70">Book not found.</p>
      ) : chapters.length === 0 ? (
        <p className="text-sm opacity-70">No chapters created yet.</p>
      ) : (
        <div className="bg-brown-dark/85 border border-gold-light/20 rounded-xl overflow-x-auto shadow-xl">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gold-light/10 text-gold-light/70">
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Access</th>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gold-pale">
              {chapters.map((chapter, index) => (
                <tr
                  key={chapter.id}
                  className="border-b border-gold-light/10 hover:bg-gold-primary/10 transition"
                >
                  <td className="px-4 py-3 font-medium">{chapter.title}</td>
                  <td className="px-4 py-3 text-gold-light/70">{chapter.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        chapter.accessLevel === "member"
                          ? "bg-purple-900/30 text-purple-300"
                          : "bg-green-900/30 text-green-300"
                      }`}
                    >
                      {chapter.accessLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gold-light/70">{chapter.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="text-gold-primary hover:text-gold-light transition text-xs font-medium underline disabled:opacity-30"
                      >
                        Up
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === chapters.length - 1}
                        className="text-gold-primary hover:text-gold-light transition text-xs font-medium underline disabled:opacity-30"
                      >
                        Down
                      </button>
                      <Link
                        to={`/admin/books/${id}/chapters/${chapter.id}/edit` as any}
                        className="text-gold-primary hover:text-gold-light transition text-xs font-medium underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(chapter.id)}
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
