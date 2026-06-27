import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, API_BASE_URL } from "../lib/api";
import { useAuth } from "./__root";

interface Chapter {
  id: string;
  title: string;
  slug: string;
  accessLevel: string;
  sortOrder: number;
}

interface Book {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverMediaId: string | null;
  status: string;
}

interface BookDetail {
  book: Book;
  chapters: Chapter[];
}

export const Route = createFileRoute("/books/$slug/")({
  component: BookOverviewPage,
});

function BookOverviewPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [data, setData] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await apiFetch(`/api/books/${slug}`);
        if (!cancelled) setData(res as BookDetail);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load book");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container-editorial">
        <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-[clamp(40px,6vw,100px)] items-center">
          <div
            className="photo-warm photo-book"
            style={{ background: "var(--paper-deep)" }}
          />
          <div className="space-y-5">
            <div className="h-3 w-1/4" style={{ background: "var(--paper-deep)" }} />
            <div className="h-12 w-2/3" style={{ background: "var(--paper-deep)" }} />
            <div className="h-3 w-3/4" style={{ background: "var(--paper-deep)" }} />
            <div className="h-3 w-1/2" style={{ background: "var(--paper-deep)" }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-prose text-center">
        <span className="eyebrow">Not found</span>
        <h1 className="display display-l mt-6">{error || "A missing chapter."}</h1>
        <p className="lead mt-6 mx-auto">
          We could not find that book. It may have moved, or never existed.
        </p>
        <Link to="/dashboard" className="btn-link mt-8 inline-flex">
          Return to the reading desk <span className="btn-arrow">→</span>
        </Link>
      </div>
    );
  }

  const { book, chapters } = data;
  const isMember =
    user && (user.role === "member" || user.role === "admin" || user.role === "editor");

  return (
    <div className="container-editorial">
      <Link to="/dashboard" className="label-meta hover:text-ink transition inline-flex items-center gap-2 mb-10">
        ← Back to the reading desk
      </Link>

      {/* HEADER */}
      <div className="grid items-center gap-[clamp(40px,6vw,100px)] mb-20 md:[grid-template-columns:minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div
          className="photo-warm photo-book"
          style={{ boxShadow: "0 50px 80px -40px rgba(24,20,16,0.55)" }}
        >
          {book.coverMediaId ? (
            <img
              src={`${API_BASE_URL}/api/upload/media/${book.coverMediaId}/content`}
              alt={book.title}
              loading="eager"
            />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <span className="label-meta">{book.title}</span>
            </div>
          )}
        </div>
        <div>
          <span className="eyebrow">
            {book.status === "published" ? "A book in print" : "Forthcoming"}
          </span>
          <h1 className="display display-l mt-5">{book.title}</h1>
          {book.description && <p className="lead mt-7">{book.description}</p>}
          <div className="mt-10 flex flex-wrap gap-8 text-[13px] text-ink-mute">
            <span>
              <span className="numeric text-ink text-[16px]">{chapters.length}</span>{" "}
              {chapters.length === 1 ? "chapter" : "chapters"}
            </span>
            {chapters.filter((c) => c.accessLevel !== "member").length > 0 && (
              <span>
                <span className="numeric text-ink text-[16px]">
                  {chapters.filter((c) => c.accessLevel !== "member").length}
                </span>{" "}
                free
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TABLE OF CONTENTS */}
      <div>
        <div className="section-header">
          <div className="left">
            <span className="eyebrow mb-5 inline-flex">Table of contents</span>
            <h2 className="display mt-2" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
              A table, <span className="italic-accent">of contents.</span>
            </h2>
          </div>
          <div className="right">
            <p className="body-prose">
              Each chapter stands alone. Free chapters open below. Members' chapters open with a
              membership.
            </p>
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-16">
            <p className="display display-s">No chapters yet.</p>
            <p className="body-prose mt-4 mx-auto">A book in slow making.</p>
          </div>
        ) : (
          <div>
            {chapters.map((chapter, idx) => {
              const isLocked = chapter.accessLevel === "member" && !isMember;
              const numeral = String(idx + 1).padStart(2, "0");
              const inner = (
                <>
                  <span className="num">{numeral}</span>
                  <div>
                    <div className="title">{chapter.title}</div>
                    <div className="meta">
                      {chapter.accessLevel === "member" ? "Members" : "Free chapter"}
                    </div>
                  </div>
                  {chapter.accessLevel === "member" ? (
                    <span className={isLocked ? "chip" : "chip chip-honey"}>
                      {isLocked ? "Locked" : "Unlocked"}
                    </span>
                  ) : (
                    <span className="chip chip-honey">Free</span>
                  )}
                </>
              );

              return isLocked ? (
                <Link key={chapter.id} to="/subscribe" className="card-row">
                  {inner}
                </Link>
              ) : (
                <Link
                  key={chapter.id}
                  to={`/books/${slug}/${chapter.slug}` as any}
                  className="card-row"
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
