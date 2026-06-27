import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { apiFetch, API_URL } from "../lib/api";
import { useAuth } from "./__root";
import { BlockRenderer, type Block } from "../components/BlockRenderer";

interface ChapterMeta {
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
  chapters: ChapterMeta[];
}

interface Chapter {
  id: string;
  title: string;
  slug: string;
  accessLevel: string;
  sortOrder: number;
  blocks: Block[];
}

interface LockedChapter {
  id: string;
  title: string;
  accessLevel: string;
  locked: true;
}

export const Route = createFileRoute("/books/$slug/$chapterSlug")({
  component: ChapterReaderPage,
});

function ChapterReaderPage() {
  const { slug, chapterSlug } = Route.useParams();
  const { user } = useAuth();
  const [bookData, setBookData] = useState<BookDetail | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [locked, setLocked] = useState<LockedChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkSaving, setBookmarkSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const isMember =
    user && (user.role === "member" || user.role === "admin" || user.role === "editor");

  useEffect(() => {
    if (!slug || !chapterSlug) return;
    let cancelled = false;
    async function load() {
      try {
        const bookRes = await apiFetch(`/api/books/${slug}`);
        if (cancelled) return;
        setBookData(bookRes as BookDetail);

        const currentChapterMeta = (bookRes as BookDetail).chapters.find(
          (c: ChapterMeta) => c.slug === chapterSlug
        );
        if (!currentChapterMeta) {
          setError("Chapter not found.");
          setLoading(false);
          return;
        }

        const chapterRes = await fetch(
          `${API_URL}/api/books/chapters/${currentChapterMeta.id}`,
          { credentials: "include" }
        );
        const chapterData = await chapterRes.json();

        if (!chapterRes.ok) {
          if (chapterRes.status === 403) {
            setLocked(chapterData as LockedChapter);
          } else {
            setError(chapterData.error || "Failed to load chapter");
          }
        } else {
          setChapter(chapterData.chapter as Chapter);
          setBookmarked(Boolean(chapterData.bookmarked));
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load chapter");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, chapterSlug]);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(Math.round(pct));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const allChapters = bookData?.chapters ?? [];
  const currentIndex = allChapters.findIndex((c) => c.slug === chapterSlug);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < allChapters.length - 1
      ? allChapters[currentIndex + 1]
      : null;
  const chapterNumeral = String(currentIndex + 1).padStart(2, "0");

  if (loading) {
    return (
      <div className="container-prose">
        <div className="space-y-6">
          <div className="h-3 w-32" style={{ background: "var(--paper-deep)" }} />
          <div className="h-12 w-2/3" style={{ background: "var(--paper-deep)" }} />
          <div className="space-y-3 mt-8">
            <div className="h-3 w-full" style={{ background: "var(--paper-deep)" }} />
            <div className="h-3 w-5/6" style={{ background: "var(--paper-deep)" }} />
            <div className="h-3 w-4/5" style={{ background: "var(--paper-deep)" }} />
            <div className="h-3 w-full" style={{ background: "var(--paper-deep)" }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-prose text-center">
        <span className="eyebrow">Not found</span>
        <h1 className="display display-l mt-6">{error}</h1>
        <Link to={`/books/${slug}` as any} className="btn-link mt-8 inline-flex">
          Back to the book <span className="btn-arrow">→</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* PROGRESS BAR */}
      <div
        className="fixed left-0 right-0 z-40 h-[2px]"
        style={{ top: 78, background: "var(--line)" }}
      >
        <div
          className="h-full transition-all duration-150"
          style={{ width: `${progress}%`, background: "var(--ink)" }}
        />
      </div>

      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12">
          {/* MAIN */}
          <article className="max-w-[680px]">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 label-meta">
                <li>
                  <Link to="/dashboard" className="hover:text-ink transition">
                    Desk
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    to={`/books/${slug}` as any}
                    className="hover:text-ink transition"
                  >
                    {bookData?.book.title || "Book"}
                  </Link>
                </li>
              </ol>
            </nav>

            <div className="flex items-baseline gap-5 mb-6">
              <span className="numeric text-honey-deep text-[14px]">
                Chapter {chapterNumeral}
              </span>
              {chapter?.accessLevel === "member" && (
                <span className="chip">Members</span>
              )}
              {chapter?.accessLevel !== "member" && !locked && (
                <span className="chip chip-honey">Free</span>
              )}
            </div>

            <h1 className="display display-l mb-10">
              {locked ? locked.title : chapter?.title}
            </h1>

            {user && chapter && (
              <div className="mb-12">
                <button
                  type="button"
                  disabled={bookmarkSaving}
                  onClick={async () => {
                    setBookmarkSaving(true);
                    try {
                      if (bookmarked) {
                        await apiFetch(`/api/books/bookmarks/${chapter.id}`, {
                          method: "DELETE",
                        });
                        setBookmarked(false);
                      } else {
                        await apiFetch("/api/books/bookmarks", {
                          method: "POST",
                          body: JSON.stringify({ chapterId: chapter.id }),
                        });
                        setBookmarked(true);
                      }
                    } catch {
                      // ignore
                    } finally {
                      setBookmarkSaving(false);
                    }
                  }}
                  className="btn-link"
                >
                  <svg
                    className="w-4 h-4"
                    fill={bookmarked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {bookmarkSaving
                    ? "Saving…"
                    : bookmarked
                    ? "Bookmarked"
                    : "Bookmark this chapter"}
                </button>
              </div>
            )}

            {locked ? (
              <div
                className="relative py-16 px-10 text-center"
                style={{
                  background: "var(--paper-soft)",
                  borderTop: "1px solid var(--line)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span className="eyebrow-bare">A members' chapter</span>
                <h2 className="display display-m mt-5">
                  This one opens with{" "}
                  <span className="italic-accent">membership.</span>
                </h2>
                <p className="lead mt-6 mx-auto">
                  Four of the seven chapters open only for members. The Sunday letter and
                  priority seating at retreats are part of the same key.
                </p>
                <Link
                  to="/subscribe"
                  className="btn-ed btn-primary mt-9 inline-flex"
                >
                  Become a member <span className="btn-arrow">→</span>
                </Link>
              </div>
            ) : chapter ? (
              <div ref={contentRef} className="body-prose max-w-none">
                <BlockRenderer blocks={chapter.blocks} className="space-y-6" />
              </div>
            ) : null}

            {/* PREV / NEXT */}
            <div
              className="flex items-center justify-between gap-4 mt-16 pt-10"
              style={{ borderTop: "1px solid var(--line)" }}
            >
              {prevChapter ? (
                <Link
                  to={`/books/${slug}/${prevChapter.slug}` as any}
                  className="group flex items-center gap-4 text-left"
                >
                  <span
                    className="grid place-items-center w-10 h-10 rounded-full border transition group-hover:bg-ink group-hover:text-paper"
                    style={{ borderColor: "var(--line-strong)" }}
                  >
                    ←
                  </span>
                  <div>
                    <span className="label-meta">Previous</span>
                    <p className="font-serif text-[18px] mt-1 leading-tight max-w-[220px]">
                      {prevChapter.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <span />
              )}
              {nextChapter ? (
                <Link
                  to={`/books/${slug}/${nextChapter.slug}` as any}
                  className="group flex items-center gap-4 text-right ml-auto"
                >
                  <div>
                    <span className="label-meta">Next</span>
                    <p className="font-serif text-[18px] mt-1 leading-tight max-w-[220px]">
                      {nextChapter.title}
                    </p>
                  </div>
                  <span
                    className="grid place-items-center w-10 h-10 rounded-full border transition group-hover:bg-ink group-hover:text-paper"
                    style={{ borderColor: "var(--line-strong)" }}
                  >
                    →
                  </span>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </article>

          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-[120px]">
              <span className="eyebrow">{bookData?.book.title || "Chapters"}</span>
              <ul className="mt-6 flex flex-col">
                {allChapters.map((ch, idx) => {
                  const isActive = ch.slug === chapterSlug;
                  const isLocked = ch.accessLevel === "member" && !isMember;
                  const numeral = String(idx + 1).padStart(2, "0");
                  return (
                    <li key={ch.id}>
                      {isLocked ? (
                        <div
                          className="grid items-baseline py-3 opacity-50"
                          style={{ gridTemplateColumns: "auto 1fr", gap: 14 }}
                        >
                          <span className="numeric text-honey-deep text-[12px]">
                            {numeral}
                          </span>
                          <span className="font-serif text-[15px] leading-tight">
                            {ch.title}
                          </span>
                        </div>
                      ) : (
                        <Link
                          to={`/books/${slug}/${ch.slug}` as any}
                          className="grid items-baseline py-3 transition"
                          style={{ gridTemplateColumns: "auto 1fr", gap: 14 }}
                        >
                          <span className="numeric text-honey-deep text-[12px]">
                            {numeral}
                          </span>
                          <span
                            className="font-serif text-[15px] leading-tight"
                            style={{
                              color: isActive ? "var(--ink)" : "var(--ink-mute)",
                              borderBottom: isActive
                                ? "1px solid var(--ink)"
                                : "1px solid transparent",
                              paddingBottom: 2,
                            }}
                          >
                            {ch.title}
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
