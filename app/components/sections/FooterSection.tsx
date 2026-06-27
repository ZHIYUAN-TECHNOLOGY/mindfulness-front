import { Link } from "@tanstack/react-router";

interface SocialLink {
  platform: string;
  url: string;
}

interface NavLink {
  label: string;
  href: string;
}

// Brand glyphs (Simple Icons paths, 24x24 viewBox, fill="currentColor")
const SOCIAL_ICONS: Record<string, string> = {
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  youtube:
    "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  facebook:
    "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  tiktok:
    "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  twitter:
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  spotify:
    "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z",
};

// Generic "globe" fallback for any platform without a brand glyph
const FALLBACK_ICON =
  "M12 2a10 10 0 100 20 10 10 0 000-20zm0 2c1.86 0 3.41 2.95 3.86 7H8.14C8.59 6.95 10.14 4 12 4zm-1.86 9h7.72C17.41 17.05 13.86 20 12 20s-3.41-2.95-3.86-7zM4.07 13h2.06c.14 1.7.5 3.27 1.03 4.58A8.03 8.03 0 014.07 13zm0-2a8.03 8.03 0 013.09-4.58c-.53 1.31-.89 2.88-1.03 4.58H4.07zm13.74 0c-.14-1.7-.5-3.27-1.03-4.58A8.03 8.03 0 0119.93 11h-2.12zm0 2h2.12a8.03 8.03 0 01-3.15 4.58c.53-1.31.89-2.88 1.03-4.58z";

function socialIconPath(platform: string): string {
  const key = platform.trim().toLowerCase().replace(/[^a-z]/g, "");
  return SOCIAL_ICONS[key] ?? FALLBACK_ICON;
}

interface Props {
  copyright: string;
  poweredBy: string;
  contactUrl: string;
  socialLinks: SocialLink[];
  navLinks: NavLink[];
  brandName?: string;
  tagline?: string;
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("http");
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <Link to={href as any}>{children}</Link>;
}

export function FooterSection({
  copyright,
  poweredBy,
  contactUrl,
  socialLinks,
  navLinks,
  brandName = "Charles Lee",
  tagline = "Founder of the Asia Pacific Consultation On Marketplace Mindfulness, APCOMM.",
}: Props) {
  const readLinks = navLinks.filter((l) =>
    /memoir|book|chapter|about/i.test(l.label + l.href)
  );

  const fallbackRead = readLinks.length
    ? readLinks
    : [
        { label: "About", href: "/about" },
        { label: "Memoir", href: "/memoir" },
      ];
  const footerAttend = [
    { label: "APCOMM 2027", href: "/events/e6941a1e-3cb2-4846-be15-78e763fb923e" },
    { label: "Events", href: "/events" },
  ];
  const footerMedia = [
    { label: "APCOMM Library", href: "/library" },
    { label: "Podcast", href: "/podcast" },
  ];

  return (
    <footer className="footer-ed">
      <div className="container-editorial">
        <div className="footer-grid">
          <div>
            <Link
              to="/"
              className="font-serif italic text-[28px] md:text-[32px] block mb-5 text-ink"
            >
              {brandName}
            </Link>
            <p className="body-prose text-[16px] max-w-[42ch]">{tagline}</p>
            {socialLinks.length > 0 && (
              <div className="socials">
                {socialLinks.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    title={s.platform}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={socialIconPath(s.platform)} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4>Read</h4>
            <ul>
              {fallbackRead.map((link) => (
                <li key={link.href + link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Listen &amp; Attend</h4>
            <ul>
              {footerAttend.map((link) => (
                <li key={link.href + link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
              <li>
                <span className="footer-subheading">Media</span>
                <ul className="footer-nested">
                  {footerMedia.map((link) => (
                    <li key={link.href + link.label}>
                      <FooterLink href={link.href}>{link.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <FooterLink href={contactUrl}>Contact</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4>
              In the present,
              <br />
              <span className="font-serif italic font-normal normal-case tracking-normal text-[17px]">Here & Now</span>
            </h4>
            <ul>
              <li>
                <a href="#newsletter" style={{ whiteSpace: "pre-wrap" }}>
                  Newsletter{"\n"}- The Mindful Christian
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-baseline">
          <span>{copyright}</span>
          <span className="flex items-center gap-4">{poweredBy}</span>
        </div>
      </div>
    </footer>
  );
}
