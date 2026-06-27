import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./__root";
import { apiFetch, API_BASE_URL } from "../lib/api";
import { getMe } from "../lib/auth";

const MEMBER_ROLES = new Set(["member", "admin", "editor"]);

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const user = await getMe();
    if (!user) {
      throw redirect({ to: "/login" });
    }
    if (!MEMBER_ROLES.has(user.role)) {
      throw redirect({ to: "/subscribe" });
    }
  },
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Reading desk · Charles Lee" }],
  }),
});

type Book = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  coverMediaId: string | null;
  coverUrl?: string | null;
};

type Chapter = {
  id: string;
  title: string;
  slug: string;
  accessLevel: string;
  sortOrder: number;
};

type BookWithChapters = {
  book: Book;
  chapters: Chapter[];
};

function CoverImage({ coverMediaId, title }: { coverMediaId?: string | null; title: string }) {
  const [error, setError] = useState(false);

  if (!coverMediaId || error) {
    return (
      <div
        className="photo-warm photo-book"
        style={{ width: 180, flexShrink: 0, alignSelf: "start" }}
      >
        <div className="w-full h-full grid place-items-center">
          <span className="label-meta">{title}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="photo-warm photo-book"
      style={{ width: 180, flexShrink: 0, alignSelf: "start" }}
    >
      <img
        src={`${API_BASE_URL}/api/upload/media/${coverMediaId}/content`}
        alt={title}
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  );
}

function DashboardPage() {
  const { user, setUser } = useAuth();
  const [booksData, setBooksData] = useState<BookWithChapters[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "profile">("overview");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [saved, setSaved] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState<Set<string>>(new Set());
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);
  const [unsubscribeMsg, setUnsubscribeMsg] = useState("");
  const [membership, setMembership] = useState<{ expiresAt: string | null }>({ expiresAt: null });

  const isMember =
    user && (user.role === "member" || user.role === "admin" || user.role === "editor");

  useEffect(() => {
    apiFetch("/api/membership/status")
      .then(setMembership)
      .catch((err) => console.error("Failed to load membership status:", err));
  }, []);

  useEffect(() => {
    if (!user) {
      getMe()
        .then((u) => u && setUser(u))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    apiFetch("/api/books/bookmarks/me")
      .then((d) => {
        const list = (d.bookmarks || []) as { chapterId: string }[];
        setBookmarkedIds(new Set(list.map((b) => b.chapterId)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadBooks() {
      try {
        const booksRes = await apiFetch("/api/books");
        const books = (booksRes.books || []) as Book[];
        const details = await Promise.all(
          books.map(async (b) => {
            const detail = await apiFetch(`/api/books/${b.slug}`);
            return {
              book: detail.book as Book,
              chapters: (detail.chapters || []) as Chapter[],
            };
          })
        );
        if (!cancelled) setBooksData(details);
      } catch {
        if (!cancelled) setBooksData([]);
      } finally {
        if (!cancelled) setBooksLoading(false);
      }
    }
    loadBooks();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const key = `profile:${user.id}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as { name?: string; phone?: string; bio?: string };
        setProfileName(parsed.name || "");
        setProfilePhone(parsed.phone || "");
        setProfileBio(parsed.bio || "");
      }
    } catch {
      // ignore
    }
  }, [user]);

  const toggleBookmark = useCallback(
    async (chapterId: string) => {
      if (!user) return;
      setBookmarkLoading((prev) => new Set(prev).add(chapterId));
      try {
        if (bookmarkedIds.has(chapterId)) {
          await apiFetch(`/api/books/bookmarks/${chapterId}`, { method: "DELETE" });
          setBookmarkedIds((prev) => {
            const next = new Set(prev);
            next.delete(chapterId);
            return next;
          });
        } else {
          await apiFetch("/api/books/bookmarks", {
            method: "POST",
            body: JSON.stringify({ chapterId }),
          });
          setBookmarkedIds((prev) => new Set(prev).add(chapterId));
        }
      } catch {
        // ignore
      } finally {
        setBookmarkLoading((prev) => {
          const next = new Set(prev);
          next.delete(chapterId);
          return next;
        });
      }
    },
    [bookmarkedIds, user]
  );

  const totalChapters = booksData.reduce((sum, b) => sum + b.chapters.length, 0);
  const unlocked = booksData.reduce(
    (sum, b) =>
      sum +
      b.chapters.filter((c) => c.accessLevel !== "member" || isMember).length,
    0
  );

  return (
    <main className="pt-[120px] pb-[100px] min-h-[100dvh]">
      <div className="container-editorial">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="eyebrow">Reading desk · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}</span>
            <h1 className="display display-l mt-5">
              Welcome back
              {profileName.trim() ? (
                <>
                  ,<br />
                  <span className="italic-accent">{profileName}.</span>
                </>
              ) : (
                <>
                  ,<br />
                  <span className="italic-accent">reader.</span>
                </>
              )}
            </h1>
          </div>

          <div className="flex flex-wrap gap-6">
            <div>
              <span className="numeric text-[28px] text-ink">{unlocked}</span>
              <div className="label-meta mt-1">Unlocked</div>
            </div>
            <div>
              <span className="numeric text-[28px] text-ink">{totalChapters}</span>
              <div className="label-meta mt-1">Chapters</div>
            </div>
            <div>
              <span className="numeric text-[28px] text-ink">{bookmarkedIds.size}</span>
              <div className="label-meta mt-1">Bookmarked</div>
            </div>
          </div>
        </div>

        {membership.expiresAt && (
          <div className="rounded-lg border border-gold-light/10 bg-brown-dark/40 p-5 mb-8">
            <span className="eyebrow">Membership</span>
            <p className="mt-2 text-gold-pale">
              Active until{" "}
              <strong>{new Date(membership.expiresAt).toLocaleDateString()}</strong>
            </p>
            {new Date(membership.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && (
              <Link
                to="/membership"
                className="btn-ed btn-primary inline-flex mt-4 text-sm"
              >
                Renew pass <span className="btn-arrow">→</span>
              </Link>
            )}
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-9 border-b border-line mb-12">
          {(
            [
              ["overview", "The reading"],
              ["profile", "Your details"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className="pb-4 -mb-px font-sans tracking-[0.06em] text-[13px] uppercase font-medium transition"
              style={{
                color: activeTab === key ? "var(--ink)" : "var(--ink-mute)",
                borderBottom:
                  activeTab === key
                    ? "1px solid var(--ink)"
                    : "1px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* BOOKS */}
            {booksLoading ? (
              <div className="grid gap-12">
                {[0, 1].map((i) => (
                  <div key={i} className="flex gap-8">
                    <div
                      className="photo-warm photo-book"
                      style={{ width: 180, background: "var(--paper-deep)" }}
                    />
                    <div className="flex-1 space-y-4">
                      <div className="h-6 w-1/3" style={{ background: "var(--paper-deep)" }} />
                      <div className="h-3 w-2/3" style={{ background: "var(--paper-deep)" }} />
                      <div className="h-3 w-1/2" style={{ background: "var(--paper-deep)" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : booksData.length === 0 ? (
              <div className="text-center py-20">
                <p className="display display-s">A quiet shelf.</p>
                <p className="body-prose mt-4 mx-auto">
                  No books on the desk yet. Charles releases each book slowly, in its own time.
                </p>
              </div>
            ) : (
              <div className="space-y-16">
                {booksData.map(({ book, chapters }) => (
                  <article key={book.id}>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <CoverImage coverMediaId={book.coverMediaId} title={book.title} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-2">
                          <h3 className="display display-m">{book.title}</h3>
                          <span className="label-meta">
                            {chapters.length}{" "}
                            {chapters.length === 1 ? "chapter" : "chapters"}
                          </span>
                        </div>
                        {book.description && (
                          <p className="body-prose mt-3" style={{ fontSize: 17 }}>
                            {book.description}
                          </p>
                        )}

                        <div className="mt-7">
                          {chapters.length === 0 ? (
                            <p className="label-meta">No chapters yet.</p>
                          ) : (
                            chapters.slice(0, 6).map((chapter, idx) => {
                              const locked =
                                chapter.accessLevel === "member" && !isMember;
                              const isBookmarked = bookmarkedIds.has(chapter.id);
                              const isLoading = bookmarkLoading.has(chapter.id);

                              return (
                                <div
                                  key={chapter.id}
                                  className="card-row"
                                  style={{
                                    gridTemplateColumns: "auto 1fr auto auto",
                                    opacity: locked ? 0.6 : 1,
                                  }}
                                >
                                  <span className="num">
                                    {String(idx + 1).padStart(2, "0")}
                                  </span>
                                  <div>
                                    {locked ? (
                                      <span className="title">{chapter.title}</span>
                                    ) : (
                                      <Link
                                        to={`/books/${book.slug}/${chapter.slug}` as any}
                                        className="title block hover:text-honey-deep transition"
                                      >
                                        {chapter.title}
                                      </Link>
                                    )}
                                    <div className="meta">
                                      {chapter.accessLevel === "member"
                                        ? "Member chapter"
                                        : "Free chapter"}
                                    </div>
                                  </div>
                                  {chapter.accessLevel === "member" && (
                                    <span className={locked ? "chip" : "chip chip-honey"}>
                                      {locked ? "Locked" : "Unlocked"}
                                    </span>
                                  )}
                                  {user && (
                                    <button
                                      type="button"
                                      disabled={isLoading}
                                      onClick={() => toggleBookmark(chapter.id)}
                                      className="w-10 h-10 grid place-items-center rounded-full border border-line-strong hover:bg-paper-soft transition disabled:opacity-40"
                                      title={
                                        isBookmarked ? "Remove bookmark" : "Bookmark chapter"
                                      }
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill={isBookmarked ? "currentColor" : "none"}
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
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {chapters.length > 6 && (
                          <Link
                            to={`/books/${book.slug}` as any}
                            className="btn-link mt-7"
                          >
                            View all {chapters.length} chapters{" "}
                            <span className="btn-arrow">→</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "profile" && (
          <div className="max-w-[680px]">
            <span className="eyebrow">A small profile</span>
            <h2 className="display display-m mt-4">
              Tell Charles <span className="italic-accent">who you are.</span>
            </h2>
            <p className="body-prose mt-5">
              Optional. Stored only in your browser, used to greet you when you return.
            </p>

            <div className="mt-12">
              <div className="grid md:grid-cols-2 gap-x-9">
                <div className="field-ed">
                  <label htmlFor="profile-name">Display Name</label>
                  <input
                    id="profile-name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="field-ed">
                  <label htmlFor="profile-phone">Phone</label>
                  <input
                    id="profile-phone"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+60 …"
                  />
                </div>
              </div>
              <div className="field-ed">
                <label htmlFor="profile-bio">A short note</label>
                <textarea
                  id="profile-bio"
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  rows={4}
                  placeholder="Tell Charles a sentence or two."
                />
              </div>

              {saved && (
                <p
                  className="mb-5 mt-3"
                  style={{ color: "var(--honey-deep)", fontSize: 14 }}
                >
                  {saved}
                </p>
              )}

              <button
                onClick={() => {
                  if (!user) return;
                  const key = `profile:${user.id}`;
                  localStorage.setItem(
                    key,
                    JSON.stringify({
                      name: profileName,
                      phone: profilePhone,
                      bio: profileBio,
                    })
                  );
                  setSaved("Saved.");
                  setTimeout(() => setSaved(""), 3000);
                }}
                className="btn-ed btn-primary mt-6"
              >
                Save profile <span className="btn-arrow">→</span>
              </button>

              <div className="mt-12 pt-8 border-t border-line">
                <span className="eyebrow">Newsletter</span>
                <h3 className="display display-s mt-4">Change your mind?</h3>
                <p className="body-prose mt-3">
                  You can unsubscribe from the newsletter at any time. This will not affect your membership or reading access.
                </p>
                {unsubscribeMsg && (
                  <p className="mt-4" style={{ color: "var(--honey-deep)", fontSize: 14 }}>
                    {unsubscribeMsg}
                  </p>
                )}
                <button
                  onClick={async () => {
                    if (!window.confirm("Are you sure you want to unsubscribe from the newsletter?")) return;
                    setUnsubscribeLoading(true);
                    setUnsubscribeMsg("");
                    try {
                      await apiFetch("/api/newsletter/unsubscribe-me", { method: "POST" });
                      const key = `newsletter_subscribed_${user?.email || "anon"}`;
                      if (typeof window !== "undefined") {
                        localStorage.removeItem(key);
                      }
                      setUnsubscribeMsg("You have been unsubscribed from the newsletter.");
                    } catch {
                      setUnsubscribeMsg("Something went wrong. Please try again.");
                    } finally {
                      setUnsubscribeLoading(false);
                    }
                  }}
                  disabled={unsubscribeLoading}
                  className="btn-ed mt-6"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--line-strong)",
                    color: "var(--ink-mute)",
                  }}
                >
                  {unsubscribeLoading ? "Unsubscribing..." : "Unsubscribe from newsletter"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
