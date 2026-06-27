import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "../routes/__root";
import { logout } from "../lib/auth";
import { normalizeMediaUrl } from "../lib/media";

const NAV_LOGO_SIZE = {
  maxHeight: 120,
  defaultHeight: 72,
  defaultWidth: 260,
};

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

function Caret({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function Navbar({
  initialSettings,
}: {
  initialSettings: Record<string, unknown>;
}) {
  const settings = initialSettings;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const location = useLocation();
  const { user, setUser } = useAuth();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 900) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open so the page doesn't
  // shift beneath it. Restores the original overflow on close / unmount.
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  if (location.pathname.startsWith("/admin")) return null;

  const navLinks = (settings["nav.links"] as NavItem[]) || [];
  const brandTitle = (settings["site.title"] as string) || "Mindfulness to Change";
  const brandAuthor = (settings["site.author"] as string) || "Dr. Charles Lee";
  const logoUrl = normalizeMediaUrl(settings["nav.logo_url"] as string);
  const logoHeight = (settings["nav.logo_height"] as number) || NAV_LOGO_SIZE.defaultHeight;
  const logoWidth = (settings["nav.logo_width"] as number) || NAV_LOGO_SIZE.defaultWidth;
  const effectiveLogoHeight = Math.min(logoHeight, NAV_LOGO_SIZE.maxHeight);
  const showAuth = (settings["auth.show_login_signup"] as boolean) ?? true;
  const ctaLabel = (settings["nav.cta_label"] as string) || "Become a member";
  const ctaHref = (settings["nav.cta_href"] as string) || "/subscribe";

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <header className={`nav-top${scrolled ? " is-scrolled" : ""}`}>
      <Link to="/" className="brand min-w-0 max-w-[60vw]">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={brandTitle}
            style={{
              // Height drives the actual rendered size — width auto-derives
              // from the natural aspect ratio so the image fills the height.
              // `logoWidth` becomes an upper bound for very wide logos.
              height: `${effectiveLogoHeight}px`,
              width: "auto",
              maxWidth: `min(${logoWidth}px, 60vw)`,
              objectFit: "contain",
              display: "block",
              filter:
                "contrast(1.35) saturate(1.45) brightness(0.85) drop-shadow(0 1px 1px rgba(24,20,16,0.18))",
            }}
          />
        ) : (
          <>
            <b>{brandTitle}</b>
            <span className="truncate inline-block max-w-full">{brandAuthor}</span>
          </>
        )}
      </Link>

      <nav className="nav-center">
        {navLinks.map((link, i) => {
          const children = Array.isArray(link.children) ? link.children : [];
          if (children.length > 0) {
            const parentActive = children.some((c) => isActive(c.href));
            return (
              <div key={i} className="nav-dd">
                <button
                  type="button"
                  className={`nav-dd-trigger${parentActive ? " is-active" : ""}`}
                  aria-haspopup="true"
                >
                  {link.label}
                  <Caret className="nav-dd-caret" />
                </button>
                <div className="nav-dd-panel" role="menu">
                  {children.map((child, ci) => (
                    <Link
                      key={ci}
                      to={child.href}
                      className={isActive(child.href) ? "is-active" : ""}
                      role="menuitem"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <Link
              key={i}
              to={link.href}
              className={isActive(link.href) ? "is-active" : ""}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            {user.role === "user" && (
              <Link
                to={"/subscribe" as any}
                className="nav-act hidden md:inline-flex"
              >
                Upgrade
              </Link>
            )}
            <Link
              to={"/dashboard" as any}
              className="nav-act hidden md:inline-flex"
            >
              Dashboard
            </Link>
            {user.role === "admin" && (
              <Link
                to={"/admin/settings" as any}
                className="nav-act hidden md:inline-flex"
              >
                Admin
              </Link>
            )}
            <button
              onClick={async () => {
                await logout();
                setUser(null);
              }}
              className="nav-act hidden md:inline-flex"
            >
              Log out
            </button>
          </>
        ) : showAuth ? (
          <>
            <Link to="/login" className="nav-act hidden md:inline-flex">
              Log in
            </Link>
            <Link to={ctaHref as any} className="nav-cta hidden sm:inline-flex">
              {ctaLabel}
            </Link>
          </>
        ) : null}

        {!menuOpen && (
          <button
            className="min-[900px]:hidden grid place-items-center w-10 h-10 rounded-full border border-line-strong text-ink hover:bg-ink hover:text-paper transition"
            onClick={() => {
              setExpandedIdx(null);
              setMenuOpen(true);
            }}
            aria-label="Open menu"
            aria-expanded={false}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        )}
      </div>

      {menuOpen && (
        <div
          className="m-drawer min-[900px]:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="container-editorial relative pb-16"
            style={{ paddingTop: "calc(var(--nav-h, 96px) + 28px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="m-drawer-head">
              <span className="eyebrow-bare">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="grid place-items-center w-10 h-10 rounded-full border border-line-strong text-ink hover:bg-ink hover:text-paper transition"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <nav className="m-nav">
              {navLinks.map((link, i) => {
                const children = Array.isArray(link.children)
                  ? link.children
                  : [];
                if (children.length > 0) {
                  const open = expandedIdx === i;
                  return (
                    <div key={i} className="m-nav-group">
                      <button
                        type="button"
                        className="m-nav-item display display-s"
                        style={{ "--i": i } as any}
                        onClick={() => setExpandedIdx(open ? null : i)}
                        aria-expanded={open}
                      >
                        <span className="m-idx">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 min-w-0">{link.label}</span>
                        <Caret
                          className={`m-nav-caret${open ? " is-open" : ""}`}
                        />
                      </button>
                      {open && (
                        <div className="m-nav-sub">
                          {children.map((child, ci) => (
                            <Link
                              key={ci}
                              to={child.href}
                              className={
                                isActive(child.href) ? "is-active" : ""
                              }
                              onClick={() => setMenuOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={i}
                    to={link.href}
                    className={`m-nav-item display display-s${
                      isActive(link.href) ? " is-active" : ""
                    }`}
                    style={{ "--i": i } as any}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="m-idx">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 min-w-0">{link.label}</span>
                    <span className="btn-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                );
              })}
            </nav>
            <div
              className="m-actions"
              style={{ "--count": navLinks.length } as any}
            >
              {user ? (
                <>
                  <Link
                    to={"/dashboard" as any}
                    className="btn-ed btn-ghost justify-between"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard <span className="btn-arrow">→</span>
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to={"/admin/settings" as any}
                      className="btn-ed btn-ghost justify-between"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin <span className="btn-arrow">→</span>
                    </Link>
                  )}
                  {user.role === "user" && (
                    <Link
                      to={"/subscribe" as any}
                      className="btn-ed btn-primary justify-between"
                      onClick={() => setMenuOpen(false)}
                    >
                      Upgrade <span className="btn-arrow">→</span>
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await logout();
                      setUser(null);
                      setMenuOpen(false);
                    }}
                    className="btn-link self-start"
                  >
                    Log out <span className="btn-arrow">→</span>
                  </button>
                </>
              ) : showAuth ? (
                <>
                  <Link
                    to="/login"
                    className="btn-ed btn-ghost justify-between"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log in <span className="btn-arrow">→</span>
                  </Link>
                  <Link
                    to={ctaHref as any}
                    className="btn-ed btn-primary justify-between"
                    onClick={() => setMenuOpen(false)}
                  >
                    {ctaLabel} <span className="btn-arrow">→</span>
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
