import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/admin/books")({
  component: BooksListPage,
});

interface Book {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

function BooksListPage() {
  const { pathname } = useLocation();
  const isIndexPage = pathname === "/admin/books" || pathname === "/admin/books/";

  if (!isIndexPage) {
    return <Outlet />;
  }

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/books")
      .then((data) => {
        setBooks(data.books || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      await apiFetch(`/api/books/${id}`, { method: "DELETE" });
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Failed to delete book.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gold-pale">Books</h1>
        <Link
          to={"/admin/books/create" as any}
          className="px-4 py-2 rounded bg-gold-primary text-brown-dark font-semibold text-sm hover:bg-gold-light transition"
        >
          New Book
        </Link>
      </div>

      {loading ? (
        <p className="text-sm opacity-70">Loading...</p>
      ) : books.length === 0 ? (
        <p className="text-sm opacity-70">No books created yet.</p>
      ) : (
        <div className="bg-brown-dark/85 border border-gold-light/20 rounded-xl overflow-x-auto shadow-xl">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gold-light/10 text-gold-light/70">
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Updated</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gold-pale">
              {books.map((book) => (
                <tr key={book.id} className="border-b border-gold-light/10 hover:bg-gold-primary/10 transition">
                  <td className="px-4 py-3 font-medium">{book.title}</td>
                  <td className="px-4 py-3 text-gold-light/70">{book.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        book.status === "published"
                          ? "bg-green-900/30 text-green-300"
                          : book.status === "draft"
                          ? "bg-yellow-900/30 text-yellow-300"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {book.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gold-light/70">
                    {new Date(book.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/books/${book.id}` as any}
                        className="text-gold-primary hover:text-gold-light transition text-xs font-medium underline"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/admin/books/${book.id}/chapters` as any}
                        className="text-gold-primary hover:text-gold-light transition text-xs font-medium underline"
                      >
                        Chapters
                      </Link>
                      <a
                        href={`/books/${book.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-primary hover:text-gold-light transition text-xs font-medium underline"
                      >
                        Preview
                      </a>
                      <button
                        onClick={() => handleDelete(book.id)}
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
