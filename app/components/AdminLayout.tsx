import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "../routes/__root";
import { logout } from "../lib/auth";

const STORAGE_KEY = "admin-sidebar-collapsed";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const stroke = "1.5";

const NAV_ITEMS: NavItem[] = [
  {
    to: "/admin/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    to: "/admin/media",
    label: "Media library",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    ),
  },
  {
    to: "/admin/newsletter",
    label: "Newsletter",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    to: "/admin/books",
    label: "Books",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    to: "/admin/events",
    label: "Events",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth();
  const location = useLocation();
  // Desktop: collapse to an icon rail. Mobile: slide-in drawer.
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Hydrate persisted collapse state after mount (avoid SSR mismatch).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  // Track viewport so the same component is a rail on desktop and a drawer
  // on mobile. Defaults to desktop for SSR — the drawer starts off-screen.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Close the drawer whenever the route changes (e.g. tapping a nav item).
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    const lock = mobileOpen && !isDesktop;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, isDesktop]);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    window.location.href = "/admin/login";
  };

  // The icon-only rail only applies on desktop; the mobile drawer is always
  // shown in full.
  const railMode = isDesktop && collapsed;
  const sidebarWidth = !isDesktop
    ? "min(284px, 86vw)"
    : collapsed
      ? 76
      : 288;

  return (
    <div className="min-h-[100dvh] lg:flex bg-paper text-ink">
      {/* ---------- Mobile top bar (hidden on desktop) ---------- */}
      <header
        className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-16 px-4"
        style={{
          background: "var(--paper-soft)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="grid place-items-center w-10 h-10 rounded-full border transition hover:bg-ink hover:text-paper"
          style={{ borderColor: "var(--line-strong)" }}
          aria-label="Open admin menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0 leading-none">
          <span className="eyebrow-bare">Admin</span>
          <div className="font-serif italic text-[20px] mt-1 truncate">Workshop</div>
        </div>
      </header>

      {/* ---------- Backdrop (mobile only) ---------- */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(24,20,16,0.5)" }}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ---------- Sidebar / drawer ---------- */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto flex flex-col shrink-0 lg:self-start
          transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{
          width: sidebarWidth,
          height: "100dvh",
          background: "var(--paper-soft)",
          borderRight: "1px solid var(--line)",
        }}
      >
        {/* Brand row */}
        <div
          className="flex items-center justify-between gap-2"
          style={{
            padding: railMode ? "20px 14px" : "26px 24px",
            borderBottom: "1px solid var(--line)",
            transition: "padding 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {!railMode && (
            <div className="min-w-0">
              <span className="eyebrow-bare">Admin</span>
              <h2 className="font-serif italic text-[26px] mt-1.5 leading-none whitespace-nowrap">
                Workshop
              </h2>
            </div>
          )}
          {/* Desktop: collapse the rail */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden lg:grid place-items-center w-10 h-10 rounded-full border transition hover:bg-ink hover:text-paper shrink-0"
            style={{ borderColor: "var(--line-strong)" }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              style={{
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          {/* Mobile: close the drawer */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid lg:hidden place-items-center w-10 h-10 rounded-full border transition hover:bg-ink hover:text-paper shrink-0"
            style={{ borderColor: "var(--line-strong)" }}
            aria-label="Close admin menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Home link — visible in both modes */}
        <Link
          to="/"
          className="flex items-center transition group"
          style={{
            padding: railMode ? "16px 0" : "16px 24px",
            justifyContent: railMode ? "center" : "flex-start",
            gap: railMode ? 0 : 14,
            color: "var(--ink-mute)",
            borderBottom: "1px solid var(--line)",
          }}
          title="Back to site"
        >
          <svg
            className="w-5 h-5 group-hover:text-ink transition"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
            />
          </svg>
          {!railMode && (
            <span className="text-[14px] tracking-[0.04em] font-medium group-hover:text-ink transition whitespace-nowrap">
              Back to site
            </span>
          )}
        </Link>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const active =
                location.pathname === item.to ||
                location.pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex items-center transition relative"
                    style={{
                      padding: railMode ? "13px 0" : "13px 24px",
                      justifyContent: railMode ? "center" : "flex-start",
                      gap: railMode ? 0 : 14,
                      color: active ? "var(--ink)" : "var(--ink-mute)",
                      background: active ? "var(--paper)" : "transparent",
                      borderLeft: active
                        ? "2px solid var(--honey)"
                        : "2px solid transparent",
                    }}
                    title={railMode ? item.label : undefined}
                  >
                    <span
                      className="w-5 h-5 shrink-0"
                      aria-hidden="true"
                      style={{ color: active ? "var(--honey-deep)" : undefined }}
                    >
                      {item.icon}
                    </span>
                    {!railMode && (
                      <span className="text-[15px] tracking-[0.04em] font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: railMode ? "18px 14px" : "20px 24px",
            borderTop: "1px solid var(--line)",
          }}
        >
          {railMode ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full grid place-items-center transition text-ink-mute hover:text-ink"
              title={`Log out — ${user?.email || ""}`}
              aria-label="Log out"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          ) : (
            <>
              <p className="text-[13px] tracking-[0.04em] text-ink-mute truncate mb-3">
                {user?.email}
              </p>
              <button
                onClick={handleLogout}
                className="text-[14px] text-ink-mute hover:text-ink transition tracking-[0.04em] font-medium"
              >
                Log out →
              </button>
            </>
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 bg-paper text-ink">
        {children}
      </main>
    </div>
  );
}
