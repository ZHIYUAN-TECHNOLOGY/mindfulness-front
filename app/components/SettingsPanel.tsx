import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { apiFetch } from "../lib/api";
import { MediaPickerModal } from "./MediaPickerModal";
import { MediaThumb } from "./MediaThumb";

const SECTIONS = ["General", "Hero", "About", "Welcoming", "Books", "Podcast", "Showcase", "Events", "Memoir", "Newsletter", "Contact", "Footer", "SEO", "Membership"];

// Timeline interface removed — About page redesign no longer uses timeline section.

const NAV_LOGO_DEFAULTS = {
  height: 72,
  width: 260,
  minHeight: 24,
  maxHeight: 120,
  minWidth: 80,
  maxWidth: 480,
};

const ABOUT_MEDIA_DEFAULTS = {
  width: 520,
  height: 560,
  minWidth: 220,
  maxWidth: 760,
  minHeight: 220,
  maxHeight: 760,
};

const BOOKS_COVER_DEFAULTS = {
  width: 320,
  height: 460,
  minWidth: 180,
  maxWidth: 520,
  minHeight: 220,
  maxHeight: 760,
};

const HERO_AUTHOR_DEFAULTS = {
  width: 384,
  height: 520,
  minWidth: 180,
  maxWidth: 1400,
  minHeight: 220,
  maxHeight: 1600,
  verticalOffset: 0,
  minVerticalOffset: -200,
  maxVerticalOffset: 400,
};

interface Episode {
  title: string;
  thumbnail_media_id: string | null;
  video_url: string;
  duration: string;
  description: string;
}

interface SpotlightItem {
  video_url: string;
}

interface ShowcaseItem {
  video_url: string;
  title?: string;
  description?: string;
}

interface MemoirZone {
  letter: string;
  word: string;
  desc: string;
}

interface MemoirVideo {
  title: string;
  youtube_id: string;
}

interface Zone {
  code: string;
  title: string;
  body: string;
}

interface TimelineItem {
  year: string;
  description: string;
  label: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface NavChild {
  label: string;
  href: string;
}

interface NavLink {
  label: string;
  href: string;
  children?: NavChild[];
}

type SettingsMap = Record<string, unknown>;

function isEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const toSafeInt = (value: string, fallback: number, min: number, max: number) => {
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

/**
 * Field / Input / Textarea / SectionCard MUST live at module scope.
 *
 * Previously these were declared inside SettingsPanel's body. Every keystroke
 * calls setDraft → SettingsPanel re-renders → those inner functions got new
 * identities → React treated them as different component types and unmounted /
 * remounted the whole subtree, so the focused <input> was destroyed after one
 * character. Hoisting them gives stable identities; SectionCard's dynamic deps
 * are passed through a context so call sites stay unchanged.
 */
interface SettingsSectionCtx {
  draft: SettingsMap;
  settings: SettingsMap;
  setDraft: React.Dispatch<React.SetStateAction<SettingsMap>>;
  anyDirty: (keys: string[]) => boolean;
  saving: boolean;
  savedSection: string | null;
  saveKeys: (keys: string[]) => Promise<void>;
}

const SettingsSectionContext = createContext<SettingsSectionCtx | null>(null);

function Field({
  label,
  children,
  dirty,
  className,
}: {
  label: string;
  children: React.ReactNode;
  dirty?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      <label className="text-gold-pale font-semibold text-[15px] flex items-center gap-2">
        {label}
        {dirty && (
          <span className="text-[11px] bg-gold-primary/20 text-gold-light px-2 py-0.5 rounded">
            modified
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-brown-dark/40 border border-gold-light/20 rounded-lg px-3.5 py-3 text-gold-pale placeholder:text-gold-light/40 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition text-[15px] ${props.className || ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-brown-dark/40 border border-gold-light/20 rounded-lg px-3.5 py-3 text-gold-pale placeholder:text-gold-light/40 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition text-[15px] resize-y ${props.className || ""}`}
    />
  );
}

function SectionCard({
  title,
  keys,
  children,
}: {
  title: string;
  keys: string[];
  children: React.ReactNode;
}) {
  const ctx = useContext(SettingsSectionContext);
  if (!ctx) return null;
  const { anyDirty, saving, savedSection, saveKeys, draft, settings, setDraft } =
    ctx;
  return (
    <div className="bg-brown-dark/40 border border-gold-light/10 rounded-xl p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-gold-light/10 pb-5">
        <h2 className="text-[22px] font-semibold text-gold-pale tracking-tight">{title}</h2>
        {anyDirty(keys) && (
          <span className="text-[13px] text-gold-light bg-gold-primary/15 px-3 py-1 rounded-full">
            unsaved changes
          </span>
        )}
      </div>
      {children}
      <div className="pt-3 flex items-center gap-4">
        <button
          onClick={() => saveKeys(keys)}
          disabled={saving || !anyDirty(keys)}
          className={`font-semibold px-6 py-3 rounded-lg transition text-[15px] ${
            anyDirty(keys)
              ? "bg-gold-primary text-brown-dark hover:bg-gold-medium"
              : "bg-gold-primary/20 text-gold-light/50 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : savedSection === title ? "Saved!" : "Save Changes"}
        </button>
        {anyDirty(keys) && (
          <button
            onClick={() => {
              const restored: SettingsMap = { ...draft };
              for (const key of keys) restored[key] = settings[key];
              setDraft(restored);
            }}
            className="text-gold-light hover:text-gold-pale text-[14px] underline transition"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [draft, setDraft] = useState<SettingsMap>({});
  const [activeSection, setActiveSection] = useState("General");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [aboutSizeLocked, setAboutSizeLocked] = useState(true);
  const [booksSizeLocked, setBooksSizeLocked] = useState(true);
  // Drag-and-drop reordering state for the podcast episodes list.
  const [epDragIndex, setEpDragIndex] = useState<number | null>(null);
  const [epDragOverIndex, setEpDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    apiFetch("/api/settings").then((data) => {
      const merged: SettingsMap = {
        ...data,
        "hero.author_image_vertical_offset": data["hero.author_image_vertical_offset"] ?? HERO_AUTHOR_DEFAULTS.verticalOffset,
        "about.media_width": data["about.media_width"] ?? ABOUT_MEDIA_DEFAULTS.width,
        "about.media_height": data["about.media_height"] ?? ABOUT_MEDIA_DEFAULTS.height,
        "books.cover_width": data["books.cover_width"] ?? BOOKS_COVER_DEFAULTS.width,
        "books.cover_height": data["books.cover_height"] ?? BOOKS_COVER_DEFAULTS.height,
        "membership.product_name": data["membership.product_name"] ?? "30-Day Membership Pass",
        "membership.product_description": data["membership.product_description"] ?? "Thirty days of members-only access to book chapters and event recordings.",
        "membership.regular_price": data["membership.regular_price"] ?? "49",
        "membership.early_bird_price": data["membership.early_bird_price"] ?? "29",
        "membership.early_bird_until": data["membership.early_bird_until"] ?? "",
        "membership.currency": data["membership.currency"] ?? "USD",
        "membership.stripe_product_id": data["membership.stripe_product_id"] ?? "",
        "contact.signature_width": data["contact.signature_width"] ?? 220,
        "contact.signature_x": data["contact.signature_x"] ?? 0,
        "contact.signature_y": data["contact.signature_y"] ?? 0,
      };
      setSettings(merged);
      setDraft(merged);
    });
  }, []);

  const saveKeys = useCallback(async (keys: string[]) => {
    const dirtyKeys = keys.filter((key) => !isEqual(draft[key], settings[key]));
    if (dirtyKeys.length === 0) return;
    setSaving(true);
    try {
      for (const key of dirtyKeys) {
        const value = draft[key] === undefined ? null : draft[key];
        await apiFetch(`/api/settings/${key}`, {
          method: "PUT",
          body: JSON.stringify({ value }),
        });
      }
      setSettings((prev) => {
        const next = { ...prev };
        for (const key of dirtyKeys) next[key] = draft[key];
        return next;
      });
      setSavedSection(activeSection);
      setTimeout(() => setSavedSection(null), 2000);
    } catch (e: any) {
      alert("Save failed: " + (e.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }, [draft, settings, activeSection]);

  const isDirty = (key: string) => !isEqual(draft[key], settings[key]);
  const anyDirty = (keys: string[]) => keys.some(isDirty);

  const [dragNavIndex, setDragNavIndex] = useState<number | null>(null);
  const [dragOverNavIndex, setDragOverNavIndex] = useState<number | null>(null);

  const updateDraft = (key: string, value: unknown) => {
    const shouldPreserveScroll = activeSection === "General" || activeSection === "Podcast" || activeSection === "Memoir";
    const y = shouldPreserveScroll ? window.scrollY : 0;
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (shouldPreserveScroll) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: y });
      });
    }
  };

  const handleNavDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDragNavIndex(index);
  };

  const handleNavDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragNavIndex === null || dragNavIndex === index) return;
    setDragOverNavIndex((prev) => (prev === index ? prev : index));
  };

  const handleNavDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragNavIndex === null) return;
    const links = [...getNavLinks(draft)];
    const [moved] = links.splice(dragNavIndex, 1);
    links.splice(index, 0, moved);
    updateDraft("nav.links", links);
    setDragNavIndex(null);
    setDragOverNavIndex(null);
  };

  const handleNavDragEnd = () => {
    setDragNavIndex(null);
    setDragOverNavIndex(null);
  };

  const handleSelectMedia = (id: string, url: string) => {
    if (!pickerTarget) return;
    if (pickerTarget.startsWith("podcast.episodes.")) {
      const parts = pickerTarget.split(".");
      const index = parseInt(parts[2], 10);
      const field = parts[3];
      const episodes = getEpisodes(draft);
      const next = [...episodes];
      next[index] = { ...next[index], [field]: url };
      updateDraft("podcast.episodes", next);
    } else {
      const value = pickerTarget.endsWith("_url") ? url : id;
      updateDraft(pickerTarget, value);
    }
  };

  const getEpisodes = (src: SettingsMap): Episode[] => {
    const val = src["podcast.episodes"];
    return Array.isArray(val) ? (val as Episode[]) : [];
  };

  const getSpotlight = (src: SettingsMap): SpotlightItem[] => {
    const val = src["podcast.spotlight_items"];
    return Array.isArray(val) ? (val as SpotlightItem[]) : [];
  };

  const getShowcaseItems = (src: SettingsMap): ShowcaseItem[] => {
    const val = src["showcase.items"];
    return Array.isArray(val) ? (val as ShowcaseItem[]) : [];
  };

  const getMemoirZones = (src: SettingsMap): MemoirZone[] => {
    const val = src["memoir.zones.items"];
    if (Array.isArray(val) && val.length > 0) return val as MemoirZone[];
    return [
      { letter: "C", word: "Creativity", desc: "Unlocking the imaginative power of the mind to generate new possibilities." },
      { letter: "R", word: "Resplendance", desc: "Shining with brilliance and radiating inner confidence outwardly." },
      { letter: "E", word: "Emotional Spirituality", desc: "Connecting deeply with feelings as a gateway to transcendent awareness." },
      { letter: "A", word: "Awareness", desc: "Cultivating presence and conscious understanding of self and surroundings." },
      { letter: "T", word: "Tolerance", desc: "Embracing patience and acceptance as strengths for navigating life." },
      { letter: "I", word: "Intention", desc: "Directing purposeful energy toward meaningful goals and vision." },
      { letter: "V", word: "Visioneering", desc: "Architecting your future through the power of mental imagery and belief." },
      { letter: "E", word: "Ergonomics", desc: "Designing the optimal environment for your mind to flourish continuously." },
    ];
  };

  const getMemoirVideos = (src: SettingsMap): MemoirVideo[] => {
    const val = src["memoir.videos.items"];
    if (Array.isArray(val) && val.length > 0) return val as MemoirVideo[];
    return [
      { title: "Writing My Memoir | Emotional Scars", youtube_id: "7ZZe70L-ngA" },
      { title: "Writing My Memoir | EP 6: Finding My Theme", youtube_id: "kcvbIehXorI" },
      { title: "Writing My Memoir | EP5: Listening With Your Eyes", youtube_id: "RkyCJOMCEiw" },
      { title: "Writing My Memoir | EP4: Tell It Like It Is", youtube_id: "yR5ALVeK7rk" },
      { title: "Writing My Memoir | EP3: The Art of Creative Transcendence", youtube_id: "A3LFFxYPNYk" },
      { title: "Writing My Memoir | EP2: The Anatomy of a Memoir", youtube_id: "RZ4Byfs1t00" },
    ];
  };

  const getZones = (src: SettingsMap): Zone[] => {
    const val = src["about_page.zones"];
    if (Array.isArray(val) && val.length > 0) return val as Zone[];
    return [];
  };

  const getTimelineItems = (src: SettingsMap): TimelineItem[] => {
    const val = src["about_page.timeline_items"];
    if (Array.isArray(val) && val.length > 0) return val as TimelineItem[];
    return [];
  };

  const getSocialLinks = (src: SettingsMap): SocialLink[] => {
    const val = src["footer.social_links"];
    return Array.isArray(val) ? (val as SocialLink[]) : [];
  };

  const getSocialUrl = (src: SettingsMap, platform: string): string => {
    const links = getSocialLinks(src);
    const found = links.find((l) => l.platform.toLowerCase() === platform.toLowerCase());
    return found?.url || "";
  };

  const setSocialUrl = (src: SettingsMap, platform: string, url: string): SocialLink[] => {
    const links = [...getSocialLinks(src)];
    const idx = links.findIndex((l) => l.platform.toLowerCase() === platform.toLowerCase());
    if (url.trim()) {
      if (idx >= 0) {
        links[idx] = { ...links[idx], url: url.trim() };
      } else {
        links.push({ platform, url: url.trim() });
      }
    } else if (idx >= 0) {
      links.splice(idx, 1);
    }
    return links;
  };

  const getNavLinks = (src: SettingsMap): NavLink[] => {
    const val = src["nav.links"];
    return Array.isArray(val) ? (val as NavLink[]) : [];
  };

  const getAssetLabel = (url: string): string => {
    if (!url) return "";
    try {
      const parsed = new URL(url, window.location.origin);
      const pathPart = parsed.pathname.split("/").filter(Boolean).pop() || "";
      if (pathPart) return decodeURIComponent(pathPart);
    } catch {
      // Fallback for malformed URLs and plain strings.
    }
    const chunks = url.split("/").filter(Boolean);
    return chunks[chunks.length - 1] || "Logo selected";
  };

  const openPicker = (target: string) => {
    setPickerTarget(target);
    setPickerOpen(true);
  };

  const getNum = (key: string, fallback: number, min: number, max: number): number =>
    toSafeInt(((draft[key] as number) || fallback).toString(), fallback, min, max);

  const updateLinkedSize = (
    widthKey: string,
    heightKey: string,
    nextWidth: number | null,
    nextHeight: number | null,
    defaults: { width: number; height: number; minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }
  ) => {
    const currentWidth = getNum(widthKey, defaults.width, defaults.minWidth, defaults.maxWidth);
    const currentHeight = getNum(heightKey, defaults.height, defaults.minHeight, defaults.maxHeight);
    const safeRatio = currentHeight > 0 ? currentWidth / currentHeight : defaults.width / defaults.height;

    const updates: SettingsMap = {};
    if (nextWidth !== null) {
      const w = toSafeInt(nextWidth.toString(), defaults.width, defaults.minWidth, defaults.maxWidth);
      updates[widthKey] = w;
      const h = Math.round(w / safeRatio);
      updates[heightKey] = toSafeInt(h.toString(), defaults.height, defaults.minHeight, defaults.maxHeight);
    } else if (nextHeight !== null) {
      const h = toSafeInt(nextHeight.toString(), defaults.height, defaults.minHeight, defaults.maxHeight);
      updates[heightKey] = h;
      const w = Math.round(h * safeRatio);
      updates[widthKey] = toSafeInt(w.toString(), defaults.width, defaults.minWidth, defaults.maxWidth);
    }
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SettingsSectionContext.Provider
      value={{ draft, settings, setDraft, anyDirty, saving, savedSection, saveKeys }}
    >
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pb-8">
      <nav className="w-full lg:w-60 shrink-0">
        <ul className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
          {SECTIONS.map((s) => (
            <li
              key={s}
              onClick={() => setActiveSection(s)}
              className={`cursor-pointer whitespace-nowrap shrink-0 lg:shrink px-4 py-3 rounded-lg text-[15px] font-medium transition ${
                activeSection === s
                  ? "bg-gold-primary text-brown-dark"
                  : "text-gold-light hover:bg-gold-primary/10 hover:text-gold-pale"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-1 min-w-0 space-y-6 pb-12 lg:pr-6 xl:pr-10">
        {activeSection === "General" && (
          <SectionCard title="General" keys={["site.title", "site.slogan", "auth.show_login_signup", "admin.notification_email", "youtube.channel_url", "nav.logo_url", "nav.logo_height", "nav.logo_width", "nav.links"]}>
            <Field label="Site Title" dirty={isDirty("site.title")}>
              <Input
                value={(draft["site.title"] as string) || ""}
                onChange={(e) => updateDraft("site.title", e.target.value)}
                placeholder="Mindfulness to Change"
              />
            </Field>
            <Field label="Slogan" dirty={isDirty("site.slogan")}>
              <Input
                value={(draft["site.slogan"] as string) || ""}
                onChange={(e) => updateDraft("site.slogan", e.target.value)}
                placeholder="From death to life"
              />
            </Field>
            <Field label="Admin Notification Email" dirty={isDirty("admin.notification_email")}>
              <Input
                type="email"
                value={(draft["admin.notification_email"] as string) || ""}
                onChange={(e) => updateDraft("admin.notification_email", e.target.value)}
                placeholder="charles@mindfulnesstochange.com"
              />
              <p className="text-xs text-gold-light/70 mt-1">
                Where admin notifications (event registrations, contact submissions, etc.) are sent.
              </p>
            </Field>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-gold-light text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={(draft["auth.show_login_signup"] as boolean) ?? true}
                  onChange={(e) => updateDraft("auth.show_login_signup", e.target.checked)}
                  className="accent-gold-primary"
                />
                Show Log In / Sign Up buttons on main page
              </label>
              {isDirty("auth.show_login_signup") && (
                <span className="text-[10px] bg-gold-primary/20 text-gold-light px-1.5 py-0.5 rounded">
                  modified
                </span>
              )}
            </div>
            <Field label="YouTube Channel URL" dirty={isDirty("youtube.channel_url")}>
              <Input
                value={(draft["youtube.channel_url"] as string) || ""}
                onChange={(e) => updateDraft("youtube.channel_url", e.target.value)}
                placeholder="https://youtube.com/@channel"
              />
            </Field>
            <div className="border-t border-gold-light/10 pt-4 space-y-4">
              <div>
                <label className="text-gold-pale font-medium text-sm mb-1.5 block">Navbar Logo Image</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => openPicker("nav.logo_url")}
                    className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                  >
                    Pick from Media
                  </button>
                  <MediaThumb url={draft["nav.logo_url"] as string} />
                  {(draft["nav.logo_url"] as string) && (
                    <button
                      onClick={() => updateDraft("nav.logo_url", "")}
                      className="text-red-300 hover:text-red-200 text-xs underline"
                    >
                      Remove Logo
                    </button>
                  )}
                  {(draft["nav.logo_url"] as string) && (
                    <span
                      className="text-xs text-gold-light truncate max-w-xs"
                      title={(draft["nav.logo_url"] as string) || ""}
                    >
                      {getAssetLabel((draft["nav.logo_url"] as string) || "") || "Logo selected"}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Logo Height (px)" dirty={isDirty("nav.logo_height")}>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={NAV_LOGO_DEFAULTS.minHeight}
                      max={NAV_LOGO_DEFAULTS.maxHeight}
                      step={1}
                      value={toSafeInt(((draft["nav.logo_height"] as number) || NAV_LOGO_DEFAULTS.height).toString(), NAV_LOGO_DEFAULTS.height, NAV_LOGO_DEFAULTS.minHeight, NAV_LOGO_DEFAULTS.maxHeight)}
                      onChange={(e) =>
                        updateDraft(
                          "nav.logo_height",
                          toSafeInt(e.target.value, NAV_LOGO_DEFAULTS.height, NAV_LOGO_DEFAULTS.minHeight, NAV_LOGO_DEFAULTS.maxHeight)
                        )
                      }
                      className="w-full accent-gold-primary"
                    />
                    <Input
                      type="number"
                      min={NAV_LOGO_DEFAULTS.minHeight}
                      max={NAV_LOGO_DEFAULTS.maxHeight}
                      step={1}
                      value={toSafeInt(((draft["nav.logo_height"] as number) || NAV_LOGO_DEFAULTS.height).toString(), NAV_LOGO_DEFAULTS.height, NAV_LOGO_DEFAULTS.minHeight, NAV_LOGO_DEFAULTS.maxHeight).toString()}
                      onChange={(e) =>
                        updateDraft(
                          "nav.logo_height",
                          toSafeInt(e.target.value, NAV_LOGO_DEFAULTS.height, NAV_LOGO_DEFAULTS.minHeight, NAV_LOGO_DEFAULTS.maxHeight)
                        )
                      }
                      className="w-24"
                    />
                  </div>
                  <p className="text-[12px] text-gold-light/70 mt-1.5">
                    Drives the actual rendered logo size. Width auto-scales to
                    preserve the image's aspect ratio. Cap is 120px.
                  </p>
                </Field>
                <Field label="Max Width (px)" dirty={isDirty("nav.logo_width")}>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={NAV_LOGO_DEFAULTS.minWidth}
                      max={NAV_LOGO_DEFAULTS.maxWidth}
                      step={1}
                      value={toSafeInt(((draft["nav.logo_width"] as number) || NAV_LOGO_DEFAULTS.width).toString(), NAV_LOGO_DEFAULTS.width, NAV_LOGO_DEFAULTS.minWidth, NAV_LOGO_DEFAULTS.maxWidth)}
                      onChange={(e) =>
                        updateDraft(
                          "nav.logo_width",
                          toSafeInt(e.target.value, NAV_LOGO_DEFAULTS.width, NAV_LOGO_DEFAULTS.minWidth, NAV_LOGO_DEFAULTS.maxWidth)
                        )
                      }
                      className="w-full accent-gold-primary"
                    />
                    <Input
                      type="number"
                      min={NAV_LOGO_DEFAULTS.minWidth}
                      max={NAV_LOGO_DEFAULTS.maxWidth}
                      step={1}
                      value={toSafeInt(((draft["nav.logo_width"] as number) || NAV_LOGO_DEFAULTS.width).toString(), NAV_LOGO_DEFAULTS.width, NAV_LOGO_DEFAULTS.minWidth, NAV_LOGO_DEFAULTS.maxWidth).toString()}
                      onChange={(e) =>
                        updateDraft(
                          "nav.logo_width",
                          toSafeInt(e.target.value, NAV_LOGO_DEFAULTS.width, NAV_LOGO_DEFAULTS.minWidth, NAV_LOGO_DEFAULTS.maxWidth)
                        )
                      }
                      className="w-24"
                    />
                  </div>
                  <p className="text-[12px] text-gold-light/70 mt-1.5">
                    Safety cap for very wide logos. Most logos won't hit this —
                    the height setting above is what actually sizes the logo.
                  </p>
                </Field>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-gold-pale font-medium text-sm">Navigation Links</label>
                <button
                  onClick={() =>
                    updateDraft("nav.links", [...getNavLinks(draft), { label: "", href: "" }])
                  }
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-1 rounded-md text-xs font-medium transition"
                >
                  + Add Link
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {getNavLinks(draft).map((link, i) => {
                  const childList = Array.isArray(link.children) ? link.children : [];
                  const hasChildren = childList.length > 0;
                  return (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => handleNavDragStart(e, i)}
                      onDragOver={(e) => handleNavDragOver(e, i)}
                      onDrop={(e) => handleNavDrop(e, i)}
                      onDragEnd={handleNavDragEnd}
                      className={`flex flex-col gap-2 bg-brown-dark/20 border border-gold-light/10 rounded-lg px-3 py-2 transition ${
                        dragNavIndex === i ? "opacity-50" : ""
                      } ${dragOverNavIndex === i && dragNavIndex !== i ? "border-gold-primary/50 bg-gold-primary/10" : ""}`}
                    >
                      <div className="flex gap-2 items-center">
                        <svg
                          className="w-4 h-4 text-gold-light/40 shrink-0 cursor-grab"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                        <span className="text-xs text-gold-light/50 font-mono shrink-0 w-5">{i + 1}</span>
                        <Input
                          placeholder="Label"
                          value={link.label}
                          onChange={(e) => {
                            const next = [...getNavLinks(draft)];
                            next[i] = { ...next[i], label: e.target.value };
                            updateDraft("nav.links", next);
                          }}
                          className="flex-1"
                        />
                        <Input
                          placeholder={hasChildren ? "Dropdown — uses sub-items" : "Href (#about)"}
                          value={hasChildren ? "" : link.href}
                          disabled={hasChildren}
                          onChange={(e) => {
                            const next = [...getNavLinks(draft)];
                            next[i] = { ...next[i], href: e.target.value };
                            updateDraft("nav.links", next);
                          }}
                          className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <button
                          onClick={() => {
                            const next = [...getNavLinks(draft)];
                            next.splice(i, 1);
                            updateDraft("nav.links", next);
                          }}
                          className="text-red-400 hover:text-red-300 text-sm px-2 shrink-0"
                        >
                          Remove
                        </button>
                      </div>

                      {childList.map((child, ci) => (
                        <div key={ci} className="flex gap-2 items-center pl-8">
                          <span className="text-gold-light/40 shrink-0 text-sm">↳</span>
                          <Input
                            placeholder="Sub-item label"
                            value={child.label}
                            onChange={(e) => {
                              const next = [...getNavLinks(draft)];
                              const children = [...(next[i].children || [])];
                              children[ci] = { ...children[ci], label: e.target.value };
                              next[i] = { ...next[i], children };
                              updateDraft("nav.links", next);
                            }}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Href (/about)"
                            value={child.href}
                            onChange={(e) => {
                              const next = [...getNavLinks(draft)];
                              const children = [...(next[i].children || [])];
                              children[ci] = { ...children[ci], href: e.target.value };
                              next[i] = { ...next[i], children };
                              updateDraft("nav.links", next);
                            }}
                            className="flex-1"
                          />
                          <button
                            onClick={() => {
                              const next = [...getNavLinks(draft)];
                              const children = [...(next[i].children || [])];
                              children.splice(ci, 1);
                              next[i] = {
                                ...next[i],
                                children: children.length ? children : undefined,
                              };
                              updateDraft("nav.links", next);
                            }}
                            className="text-red-400 hover:text-red-300 text-sm px-2 shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const next = [...getNavLinks(draft)];
                          const children = [...(next[i].children || []), { label: "", href: "" }];
                          next[i] = { ...next[i], children };
                          updateDraft("nav.links", next);
                        }}
                        className="self-start ml-8 text-gold-light/70 hover:text-gold-pale text-xs font-medium transition"
                      >
                        + Sub-item
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>
        )}

        {activeSection === "Hero" && (
          <SectionCard
            title="Hero Section"
            keys={[
              "hero.video_url",
              "hero.banner_url",
              "hero.signature_url",
              "hero.signature_width",
              "hero.signature_bottom",
              "hero.signature_right",
              "hero.author_image_url",
              "hero.author_image_vertical_offset",
              "hero.author_image_object_position",
              "hero.overlay_text",
              "hero.body",
              "hero.title_font_family",
              "hero.title_font_size",
              "hero.title_bold",
              "hero.title_italic",
              "hero.title_color",
              "hero.title_shadow",
              "hero.title_first_letter_style",
            ]}
          >
            <div>
              <label className="text-gold-pale font-medium text-sm mb-1.5 block">Background Video</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openPicker("hero.video_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                >
                  Pick from Media
                </button>
                <MediaThumb url={draft["hero.video_url"] as string} />
                {(draft["hero.video_url"] as string) && (
                  <span className="text-xs text-gold-light truncate max-w-xs">
                    {(draft["hero.video_url"] as string)?.slice(0, 60)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gold-light/70 mt-2">
                Recommended: use a direct MP4/WebM URL for reliable autoplay and scroll-based pause/resume.
              </p>
            </div>
            <div>
              <label className="text-gold-pale font-medium text-sm mb-1.5 block">Banner Image</label>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => openPicker("hero.banner_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                >
                  Pick from Media
                </button>
                <MediaThumb url={draft["hero.banner_url"] as string} />
                {(draft["hero.banner_url"] as string) && (
                  <button
                    onClick={() => updateDraft("hero.banner_url", "")}
                    className="text-red-300 hover:text-red-200 text-xs underline"
                  >
                    Remove Banner
                  </button>
                )}
                {(draft["hero.banner_url"] as string) && (
                  <span
                    className="text-xs text-gold-light truncate max-w-xs"
                    title={(draft["hero.banner_url"] as string) || ""}
                  >
                    {getAssetLabel((draft["hero.banner_url"] as string) || "") || "Banner selected"}
                  </span>
                )}
              </div>
              <p className="text-xs text-gold-light/70 mt-2">
                Displayed full-width between the video and the scrolling text below it.
              </p>
            </div>
            <div>
              <label className="text-gold-pale font-medium text-sm mb-1.5 block">Signature Overlay</label>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => openPicker("hero.signature_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                >
                  Pick from Media
                </button>
                <MediaThumb url={draft["hero.signature_url"] as string} />
                {(draft["hero.signature_url"] as string) && (
                  <button
                    onClick={() => updateDraft("hero.signature_url", "")}
                    className="text-red-300 hover:text-red-200 text-xs underline"
                  >
                    Remove Signature
                  </button>
                )}
                {(draft["hero.signature_url"] as string) && (
                  <span
                    className="text-xs text-gold-light truncate max-w-xs"
                    title={(draft["hero.signature_url"] as string) || ""}
                  >
                    {getAssetLabel((draft["hero.signature_url"] as string) || "") || "Signature selected"}
                  </span>
                )}
              </div>
              <p className="text-xs text-gold-light/70 mt-2">
                Transparent PNG recommended. Displays as an overlay on the hero section.
              </p>
            </div>
            <Field label={`Signature Width (${(draft["hero.signature_width"] as number) || 220}px)`} dirty={isDirty("hero.signature_width")}>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={60}
                  max={600}
                  step={1}
                  value={(draft["hero.signature_width"] as number) || 220}
                  onChange={(e) => updateDraft("hero.signature_width", parseInt(e.target.value, 10))}
                  className="w-full accent-gold-primary"
                />
                <Input
                  type="number"
                  min={60}
                  max={600}
                  step={1}
                  value={((draft["hero.signature_width"] as number) || 220).toString()}
                  onChange={(e) => updateDraft("hero.signature_width", parseInt(e.target.value, 10) || 220)}
                  className="w-24"
                />
              </div>
            </Field>
            <Field label={`Signature Bottom Position (${(draft["hero.signature_bottom"] as number) ?? 80}px from bottom)`} dirty={isDirty("hero.signature_bottom")}>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={600}
                  step={1}
                  value={(draft["hero.signature_bottom"] as number) ?? 80}
                  onChange={(e) => updateDraft("hero.signature_bottom", parseInt(e.target.value, 10))}
                  className="w-full accent-gold-primary"
                />
                <Input
                  type="number"
                  min={0}
                  max={600}
                  step={1}
                  value={((draft["hero.signature_bottom"] as number) ?? 80).toString()}
                  onChange={(e) => updateDraft("hero.signature_bottom", parseInt(e.target.value, 10) ?? 80)}
                  className="w-24"
                />
              </div>
              <p className="text-xs text-gold-light/70 mt-1">
                Distance from the bottom of the hero image. Increase to move the signature higher up.
              </p>
            </Field>
            <Field label={`Signature Right Position (${(draft["hero.signature_right"] as number) ?? 24}px from right)`} dirty={isDirty("hero.signature_right")}>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={-200}
                  max={600}
                  step={1}
                  value={(draft["hero.signature_right"] as number) ?? 24}
                  onChange={(e) => updateDraft("hero.signature_right", parseInt(e.target.value, 10))}
                  className="w-full accent-gold-primary"
                />
                <Input
                  type="number"
                  min={-200}
                  max={600}
                  step={1}
                  value={((draft["hero.signature_right"] as number) ?? 24).toString()}
                  onChange={(e) => updateDraft("hero.signature_right", parseInt(e.target.value, 10) ?? 24)}
                  className="w-24"
                />
              </div>
              <p className="text-xs text-gold-light/70 mt-1">
                Positive moves left; negative moves right past the edge.
              </p>
            </Field>
            <div>
              <label className="text-gold-pale font-medium text-sm mb-1.5 block">Author Image</label>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => openPicker("hero.author_image_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                >
                  Pick from Media
                </button>
                <MediaThumb url={draft["hero.author_image_url"] as string} />
                {(draft["hero.author_image_url"] as string) && (
                  <button
                    onClick={() => updateDraft("hero.author_image_url", "")}
                    className="text-red-300 hover:text-red-200 text-xs underline"
                  >
                    Remove Author Image
                  </button>
                )}
                {(draft["hero.author_image_url"] as string) && (
                  <span
                    className="text-xs text-gold-light truncate max-w-xs"
                    title={(draft["hero.author_image_url"] as string) || ""}
                  >
                    {getAssetLabel((draft["hero.author_image_url"] as string) || "") || "Author image selected"}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-gold-primary/10 border border-gold-light/20 rounded-lg p-4">
              <p className="text-xs text-gold-light/90 leading-relaxed">
                <span className="font-semibold text-gold-pale">Layout:</span> The hero uses a 50/50 split — text on the left, author image filling the right half edge-to-edge. On mobile, it stacks vertically with the image below the text.
              </p>
            </div>
            <Field label={`Signature Vertical Offset (${(draft["hero.author_image_vertical_offset"] as number) ?? HERO_AUTHOR_DEFAULTS.verticalOffset}px)`} dirty={isDirty("hero.author_image_vertical_offset")}>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={HERO_AUTHOR_DEFAULTS.minVerticalOffset}
                  max={HERO_AUTHOR_DEFAULTS.maxVerticalOffset}
                  step={1}
                  value={toSafeInt(((draft["hero.author_image_vertical_offset"] as number) || HERO_AUTHOR_DEFAULTS.verticalOffset).toString(), HERO_AUTHOR_DEFAULTS.verticalOffset, HERO_AUTHOR_DEFAULTS.minVerticalOffset, HERO_AUTHOR_DEFAULTS.maxVerticalOffset)}
                  onChange={(e) =>
                    updateDraft(
                      "hero.author_image_vertical_offset",
                      toSafeInt(e.target.value, HERO_AUTHOR_DEFAULTS.verticalOffset, HERO_AUTHOR_DEFAULTS.minVerticalOffset, HERO_AUTHOR_DEFAULTS.maxVerticalOffset)
                    )
                  }
                  className="w-full accent-gold-primary"
                />
                <Input
                  type="number"
                  min={HERO_AUTHOR_DEFAULTS.minVerticalOffset}
                  max={HERO_AUTHOR_DEFAULTS.maxVerticalOffset}
                  step={1}
                  value={toSafeInt(((draft["hero.author_image_vertical_offset"] as number) || HERO_AUTHOR_DEFAULTS.verticalOffset).toString(), HERO_AUTHOR_DEFAULTS.verticalOffset, HERO_AUTHOR_DEFAULTS.minVerticalOffset, HERO_AUTHOR_DEFAULTS.maxVerticalOffset).toString()}
                  onChange={(e) =>
                    updateDraft(
                      "hero.author_image_vertical_offset",
                      toSafeInt(e.target.value, HERO_AUTHOR_DEFAULTS.verticalOffset, HERO_AUTHOR_DEFAULTS.minVerticalOffset, HERO_AUTHOR_DEFAULTS.maxVerticalOffset)
                    )
                  }
                  className="w-24"
                />
              </div>
              <p className="text-xs text-gold-light/70 mt-1">
                Adjusts the signature position up or down on desktop.
              </p>
            </Field>
            <Field label={`Image Vertical Position (${(draft["hero.author_image_object_position"] as number) ?? 52}%)`} dirty={isDirty("hero.author_image_object_position")}>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={toSafeInt(((draft["hero.author_image_object_position"] as number) || 52).toString(), 52, 0, 100)}
                  onChange={(e) =>
                    updateDraft(
                      "hero.author_image_object_position",
                      toSafeInt(e.target.value, 52, 0, 100)
                    )
                  }
                  className="w-full accent-gold-primary"
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={toSafeInt(((draft["hero.author_image_object_position"] as number) || 35).toString(), 35, 0, 100).toString()}
                  onChange={(e) =>
                    updateDraft(
                      "hero.author_image_object_position",
                      toSafeInt(e.target.value, 52, 0, 100)
                    )
                  }
                  className="w-24"
                />
              </div>
              <p className="text-xs text-gold-light/70 mt-1">
                Controls how the image is cropped vertically. Lower values show more of the top (head), higher values show more of the bottom (torso/hands).
              </p>
            </Field>
            <Field label="Subtitle" dirty={isDirty("hero.overlay_text")}>
              <Input
                value={(draft["hero.overlay_text"] as string) || ""}
                onChange={(e) => updateDraft("hero.overlay_text", e.target.value)}
                placeholder="ABOUT THE AUTHOR"
              />
              <p className="text-xs text-gold-light/70 mt-1">
                Small uppercase label displayed above the hero title.
              </p>
            </Field>
            <Field label="Body" dirty={isDirty("hero.body")}>
              <Textarea
                rows={5}
                value={(draft["hero.body"] as string) || ""}
                onChange={(e) => updateDraft("hero.body", e.target.value)}
                placeholder="Write the homepage hero paragraph here..."
              />
              <p className="text-xs text-gold-light/70 mt-1">
                The intro paragraph shown under the hero slogan on the homepage.
                Independent from the About section text.
              </p>
            </Field>
          </SectionCard>
        )}

        {activeSection === "About" && (
          <div className="space-y-6">
            <SectionCard
              title="About Page — Hero"
              keys={[
                "about_page.eyebrow",
                "about_page.heading_line1",
                "about_page.heading_line2_italic",
                "about_page.heading_line3",
                "about_page.body",
              ]}
            >
              <p className="text-xs text-gold-light/70 -mt-2 mb-3">
                Top hero section of the About page. Heading is stacked in three lines with the second line in italic gold.
              </p>
              <Field label="Eyebrow" dirty={isDirty("about_page.eyebrow")}>
                <Input
                  value={(draft["about_page.eyebrow"] as string) || ""}
                  onChange={(e) => updateDraft("about_page.eyebrow", e.target.value)}
                  placeholder="ABOUT"
                />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Heading Line 1" dirty={isDirty("about_page.heading_line1")}>
                  <Input
                    value={(draft["about_page.heading_line1"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.heading_line1", e.target.value)}
                    placeholder="A SURGEON"
                  />
                </Field>
                <Field label="Line 2 (Italic)" dirty={isDirty("about_page.heading_line2_italic")}>
                  <Input
                    value={(draft["about_page.heading_line2_italic"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.heading_line2_italic", e.target.value)}
                    placeholder="who learned"
                  />
                </Field>
                <Field label="Heading Line 3" dirty={isDirty("about_page.heading_line3")}>
                  <Input
                    value={(draft["about_page.heading_line3"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.heading_line3", e.target.value)}
                    placeholder="TO TRUST GOD."
                  />
                </Field>
              </div>
              <Field label="Body Paragraph" dirty={isDirty("about_page.body")}>
                <Textarea
                  rows={5}
                  value={(draft["about_page.body"] as string) || ""}
                  onChange={(e) => updateDraft("about_page.body", e.target.value)}
                  placeholder="Plastic Surgeon Dr. Charles Lee shares his calling..."
                />
              </Field>
            </SectionCard>

            <SectionCard
              title="About Page — The Story"
              keys={[
                "about_page.story_eyebrow",
                "about_page.story_heading_line1",
                "about_page.story_heading_line2",
                "about_page.story_heading_line3",
                "about_page.story_image1_url",
                "about_page.story_image1_caption",
                "about_page.story_image1_blur",
                "about_page.story_image2_url",
                "about_page.story_image2_caption",
                "about_page.story_intro",
                "about_page.story_visitation_heading",
                "about_page.story_visitation_body",
                "about_page.story_miracle_heading",
                "about_page.story_miracle_body",
                "about_page.story_extraordinary_heading",
                "about_page.story_extraordinary_body",
                "about_page.story_quote",
                "about_page.story_mindfulness_heading",
                "about_page.story_mindfulness_body",
                "about_page.story_cta_url",
              ]}
            >
              <p className="text-xs text-gold-light/70 -mt-2 mb-3">
                The narrative section with heading, 2 images, and the full story text below them.
              </p>

              <div className="border border-gold-light/10 rounded-lg p-4 mb-4 space-y-4 bg-brown-dark/10">
                <p className="text-xs text-gold-light/60 font-medium uppercase tracking-wider">Section Heading</p>
                <Field label="Eyebrow" dirty={isDirty("about_page.story_eyebrow")}>
                  <Input
                    value={(draft["about_page.story_eyebrow"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.story_eyebrow", e.target.value)}
                    placeholder="THE STORY"
                  />
                </Field>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Heading Line 1" dirty={isDirty("about_page.story_heading_line1")}>
                    <Input
                      value={(draft["about_page.story_heading_line1"] as string) || ""}
                      onChange={(e) => updateDraft("about_page.story_heading_line1", e.target.value)}
                      placeholder="A MIRACLE,"
                    />
                    <p className="text-[12px] text-gold-light/70 mt-1">Gold underline on page.</p>
                  </Field>
                  <Field label="Heading Line 2" dirty={isDirty("about_page.story_heading_line2")}>
                    <Input
                      value={(draft["about_page.story_heading_line2"] as string) || ""}
                      onChange={(e) => updateDraft("about_page.story_heading_line2", e.target.value)}
                      placeholder="AN EXTRAORDINARY"
                    />
                  </Field>
                  <Field label="Heading Line 3" dirty={isDirty("about_page.story_heading_line3")}>
                    <Input
                      value={(draft["about_page.story_heading_line3"] as string) || ""}
                      onChange={(e) => updateDraft("about_page.story_heading_line3", e.target.value)}
                      placeholder="BEGINNING"
                    />
                  </Field>
                </div>
              </div>

              <div className="border border-gold-light/10 rounded-lg p-4 mb-4 space-y-4 bg-brown-dark/10">
                <p className="text-xs text-gold-light/60 font-medium uppercase tracking-wider">Story Images</p>
                {([1, 2] as const).map((n) => {
                  const urlKey = `about_page.story_image${n}_url` as const;
                  const capKey = `about_page.story_image${n}_caption` as const;
                  return (
                    <div key={n} className="border-t border-gold-light/10 pt-4 first:border-t-0 first:pt-0">
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <button
                          onClick={() => openPicker(urlKey)}
                          className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-4 py-2.5 rounded-md text-[13px] font-medium transition border border-gold-light/10"
                        >
                          Pick Image {n}
                        </button>
                        <MediaThumb url={draft[urlKey] as string} />
                        {(draft[urlKey] as string) && (
                          <>
                            <span
                              className="text-[13px] text-gold-light truncate max-w-xs"
                              title={(draft[urlKey] as string) || ""}
                            >
                              {getAssetLabel((draft[urlKey] as string) || "") || "Image selected"}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateDraft(urlKey, "")}
                              className="text-[12px] text-gold-light/70 hover:text-red-300 transition"
                            >
                              Clear
                            </button>
                          </>
                        )}
                      </div>
                      <Field label={`Caption ${n}`} dirty={isDirty(capKey)}>
                        <Input
                          value={(draft[capKey] as string) || ""}
                          onChange={(e) => updateDraft(capKey, e.target.value)}
                          placeholder={n === 1 ? "5 APRIL 1995" : "10 DAYS LATER - 15 APRIL 1995"}
                        />
                      </Field>
                      {n === 1 && (
                        <div className="flex items-center gap-2 mt-3">
                          <input
                            id="story-image-1-blur"
                            type="checkbox"
                            checked={!!draft["about_page.story_image1_blur"]}
                            onChange={(e) =>
                              updateDraft("about_page.story_image1_blur", e.target.checked)
                            }
                            className="accent-gold-primary w-4 h-4"
                          />
                          <label
                            htmlFor="story-image-1-blur"
                            className="text-[13px] text-gold-light cursor-pointer select-none"
                          >
                            Blur first image (click to reveal)
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border border-gold-light/10 rounded-lg p-4 space-y-5 bg-brown-dark/10">
                <p className="text-xs text-gold-light/60 font-medium uppercase tracking-wider">Story Narrative</p>

                <Field label="Intro Paragraph" dirty={isDirty("about_page.story_intro")}>
                  <Textarea
                    rows={4}
                    value={(draft["about_page.story_intro"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.story_intro", e.target.value)}
                    placeholder="On a Wednesday afternoon on the 5th of April, 1995..."
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Visitation Heading" dirty={isDirty("about_page.story_visitation_heading")}>
                    <Input
                      value={(draft["about_page.story_visitation_heading"] as string) || ""}
                      onChange={(e) => updateDraft("about_page.story_visitation_heading", e.target.value)}
                      placeholder="A Visitation from God"
                    />
                  </Field>
                  <Field label="Miracle Heading" dirty={isDirty("about_page.story_miracle_heading")}>
                    <Input
                      value={(draft["about_page.story_miracle_heading"] as string) || ""}
                      onChange={(e) => updateDraft("about_page.story_miracle_heading", e.target.value)}
                      placeholder="A Miracle"
                    />
                  </Field>
                </div>

                <Field label="Visitation Body" dirty={isDirty("about_page.story_visitation_body")}>
                  <Textarea
                    rows={6}
                    value={(draft["about_page.story_visitation_body"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.story_visitation_body", e.target.value)}
                    placeholder="On the 11th of February, 1995..."
                  />
                </Field>

                <Field label="Miracle Body" dirty={isDirty("about_page.story_miracle_body")}>
                  <Textarea
                    rows={8}
                    value={(draft["about_page.story_miracle_body"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.story_miracle_body", e.target.value)}
                    placeholder="In ten days, from the 5th to the 15th of April..."
                  />
                </Field>

                <Field label="Extraordinary Heading" dirty={isDirty("about_page.story_extraordinary_heading")}>
                  <Input
                    value={(draft["about_page.story_extraordinary_heading"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.story_extraordinary_heading", e.target.value)}
                    placeholder="An Extraordinary Beginning"
                  />
                </Field>

                <Field label="Extraordinary Body" dirty={isDirty("about_page.story_extraordinary_body")}>
                  <Textarea
                    rows={10}
                    value={(draft["about_page.story_extraordinary_body"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.story_extraordinary_body", e.target.value)}
                    placeholder="In May of 1996, I was led by the Spirit..."
                  />
                </Field>

                <Field label="Quote" dirty={isDirty("about_page.story_quote")}>
                  <Textarea
                    rows={2}
                    value={(draft["about_page.story_quote"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.story_quote", e.target.value)}
                    placeholder='"What is man that you are mindful of him." Psalm 8:4'
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Mindfulness Heading" dirty={isDirty("about_page.story_mindfulness_heading")}>
                    <Input
                      value={(draft["about_page.story_mindfulness_heading"] as string) || ""}
                      onChange={(e) => updateDraft("about_page.story_mindfulness_heading", e.target.value)}
                      placeholder="Biblical Mindfulness"
                    />
                  </Field>
                  <Field label="CTA URL" dirty={isDirty("about_page.story_cta_url")}>
                    <Input
                      value={(draft["about_page.story_cta_url"] as string) || ""}
                      onChange={(e) => updateDraft("about_page.story_cta_url", e.target.value)}
                      placeholder="https://www.mindfulnesstochange.com/apcomm2027"
                    />
                  </Field>
                </div>

                <Field label="Mindfulness Body" dirty={isDirty("about_page.story_mindfulness_body")}>
                  <Textarea
                    rows={8}
                    value={(draft["about_page.story_mindfulness_body"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.story_mindfulness_body", e.target.value)}
                    placeholder="The search for meaning of the Hebraic perspective..."
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              title="About Page — H.E.B.R.A.I.C. Zones"
              keys={[
                "about_page.zones_eyebrow",
                "about_page.zones_heading_line1",
                "about_page.zones_heading_line2",
                "about_page.zones_heading_accent",
                "about_page.zones_description",
                "about_page.zones",
              ]}
            >
              <p className="text-xs text-gold-light/70 -mt-2 mb-3">
                The 7-zone grid shown below the story section on the About page.
              </p>
              <Field label="Zones Eyebrow" dirty={isDirty("about_page.zones_eyebrow")}>
                <Input
                  value={(draft["about_page.zones_eyebrow"] as string) || ""}
                  onChange={(e) => updateDraft("about_page.zones_eyebrow", e.target.value)}
                  placeholder="A framework, in seven"
                />
              </Field>
              <Field label="Heading Line 1" dirty={isDirty("about_page.zones_heading_line1")}>
                <Input
                  value={(draft["about_page.zones_heading_line1"] as string) || ""}
                  onChange={(e) => updateDraft("about_page.zones_heading_line1", e.target.value)}
                  placeholder="THE"
                />
              </Field>
              <Field label="Heading Line 2" dirty={isDirty("about_page.zones_heading_line2")}>
                <Input
                  value={(draft["about_page.zones_heading_line2"] as string) || ""}
                  onChange={(e) => updateDraft("about_page.zones_heading_line2", e.target.value)}
                  placeholder="H.E.B.R.A.I.C."
                />
              </Field>
              <Field label="Heading Accent" dirty={isDirty("about_page.zones_heading_accent")}>
                <Input
                  value={(draft["about_page.zones_heading_accent"] as string) || ""}
                  onChange={(e) => updateDraft("about_page.zones_heading_accent", e.target.value)}
                  placeholder="zones."
                />
                <p className="text-[12px] text-gold-light/70 mt-1">
                  This part is rendered in italic accent style.
                </p>
              </Field>
              <Field label="Zones Description" dirty={isDirty("about_page.zones_description")}>
                <Textarea
                  rows={3}
                  value={(draft["about_page.zones_description"] as string) || ""}
                  onChange={(e) => updateDraft("about_page.zones_description", e.target.value)}
                  placeholder="Each zone is a small practice..."
                />
              </Field>

              <div className="border-t border-gold-light/10 pt-5 mt-2 space-y-5">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-gold-pale font-medium text-sm">7 Zones</label>
                  <button
                    onClick={() => {
                      const cur = getZones(draft);
                      if (cur.length < 7) {
                        updateDraft("about_page.zones", [
                          ...cur,
                          { code: "", title: "", body: "" },
                        ]);
                      }
                    }}
                    className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-1 rounded-md text-xs font-medium transition"
                  >
                    + Add Zone
                  </button>
                </div>
                {getZones(draft).map((zone, i) => (
                  <div
                    key={i}
                    className="bg-brown-dark/20 border border-gold-light/10 rounded-lg px-3 py-2 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gold-light/50 font-mono">Zone {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = getZones(draft);
                          const next = cur.filter((_, idx) => idx !== i);
                          updateDraft("about_page.zones", next.length ? next : undefined);
                        }}
                        className="text-[12px] text-gold-light/70 hover:text-red-300 transition"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Code (e.g. 01 · H)"
                        value={zone.code || ""}
                        onChange={(e) => {
                          const cur = getZones(draft);
                          cur[i] = { ...cur[i], code: e.target.value };
                          updateDraft("about_page.zones", cur);
                        }}
                      />
                      <Input
                        placeholder="Title (e.g. Hebraic)"
                        value={zone.title || ""}
                        onChange={(e) => {
                          const cur = getZones(draft);
                          cur[i] = { ...cur[i], title: e.target.value };
                          updateDraft("about_page.zones", cur);
                        }}
                      />
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Body text..."
                      value={zone.body || ""}
                      onChange={(e) => {
                        const cur = getZones(draft);
                        cur[i] = { ...cur[i], body: e.target.value };
                        updateDraft("about_page.zones", cur);
                      }}
                    />
                  </div>
                ))}
                {getZones(draft).length === 0 && (
                  <p className="text-[12px] text-gold-light/50">
                    Leave empty to use the default 7 zones.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="About Page — CTA"
              keys={[
                "about_page.cta_heading_line1",
                "about_page.cta_heading_accent",
                "about_page.cta_button1_label",
                "about_page.cta_button1_url",
                "about_page.cta_button2_label",
                "about_page.cta_button2_url",
              ]}
            >
              <p className="text-xs text-gold-light/70 -mt-2 mb-3">
                The call-to-action section shown at the bottom of the About page, before the footer.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Heading Line 1" dirty={isDirty("about_page.cta_heading_line1")}>
                  <Input
                    value={(draft["about_page.cta_heading_line1"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.cta_heading_line1", e.target.value)}
                    placeholder="BEGIN WHERE"
                  />
                </Field>
                <Field label="Heading Accent" dirty={isDirty("about_page.cta_heading_accent")}>
                  <Input
                    value={(draft["about_page.cta_heading_accent"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.cta_heading_accent", e.target.value)}
                    placeholder="you are."
                  />
                  <p className="text-[12px] text-gold-light/70 mt-1">
                    Rendered in italic accent style.
                  </p>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Field label="Primary Button Label" dirty={isDirty("about_page.cta_button1_label")}>
                  <Input
                    value={(draft["about_page.cta_button1_label"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.cta_button1_label", e.target.value)}
                    placeholder="VISIT APCOMM 2027"
                  />
                </Field>
                <Field label="Primary Button URL" dirty={isDirty("about_page.cta_button1_url")}>
                  <Input
                    value={(draft["about_page.cta_button1_url"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.cta_button1_url", e.target.value)}
                    placeholder="/events/e6941a1e-3cb2-4846-be15-78e763fb923e"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Field label="Secondary Button Label" dirty={isDirty("about_page.cta_button2_label")}>
                  <Input
                    value={(draft["about_page.cta_button2_label"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.cta_button2_label", e.target.value)}
                    placeholder="READ THE MEMOIR"
                  />
                </Field>
                <Field label="Secondary Button URL" dirty={isDirty("about_page.cta_button2_url")}>
                  <Input
                    value={(draft["about_page.cta_button2_url"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.cta_button2_url", e.target.value)}
                    placeholder="/memoir"
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              title="About Page — Timeline (A Calling in Years)"
              keys={[
                "about_page.timeline_eyebrow",
                "about_page.timeline_heading_line1",
                "about_page.timeline_heading_line2",
                "about_page.timeline_heading_line3",
                "about_page.timeline_heading_accent",
                "about_page.timeline_quote",
                "about_page.timeline_items",
              ]}
            >
              <p className="text-xs text-gold-light/70 -mt-2 mb-3">
                The \"A Calling in Years\" timeline section shown below the H.E.B.R.A.I.C. zones on the About page.
              </p>
              <Field label="Eyebrow" dirty={isDirty("about_page.timeline_eyebrow")}>
                <Input
                  value={(draft["about_page.timeline_eyebrow"] as string) || ""}
                  onChange={(e) => updateDraft("about_page.timeline_eyebrow", e.target.value)}
                  placeholder="A CALLING IN YEARS"
                />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Heading Line 1" dirty={isDirty("about_page.timeline_heading_line1")}>
                  <Input
                    value={(draft["about_page.timeline_heading_line1"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.timeline_heading_line1", e.target.value)}
                    placeholder="FORTY-"
                  />
                </Field>
                <Field label="Heading Line 2" dirty={isDirty("about_page.timeline_heading_line2")}>
                  <Input
                    value={(draft["about_page.timeline_heading_line2"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.timeline_heading_line2", e.target.value)}
                    placeholder="ONE"
                  />
                </Field>
                <Field label="Heading Line 3" dirty={isDirty("about_page.timeline_heading_line3")}>
                  <Input
                    value={(draft["about_page.timeline_heading_line3"] as string) || ""}
                    onChange={(e) => updateDraft("about_page.timeline_heading_line3", e.target.value)}
                    placeholder="YEARS,"
                  />
                </Field>
              </div>
              <Field label="Heading Accent (italic)" dirty={isDirty("about_page.timeline_heading_accent")}>
                <Input
                  value={(draft["about_page.timeline_heading_accent"] as string) || ""}
                  onChange={(e) => updateDraft("about_page.timeline_heading_accent", e.target.value)}
                  placeholder="prayerfully."
                />
              </Field>
              <Field label="Quote" dirty={isDirty("about_page.timeline_quote")}>
                <Textarea
                  rows={3}
                  value={(draft["about_page.timeline_quote"] as string) || ""}
                  onChange={(e) => updateDraft("about_page.timeline_quote", e.target.value)}
                  placeholder='A journey "with foundations, whose architect and builder is God." Hebrews 11:10'
                />
              </Field>

              <div className="border-t border-gold-light/10 pt-5 mt-2 space-y-5">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-gold-pale font-medium text-sm">Timeline Items</label>
                  <button
                    onClick={() => {
                      const cur = getTimelineItems(draft);
                      updateDraft("about_page.timeline_items", [
                        ...cur,
                        { year: "", description: "", label: "" },
                      ]);
                    }}
                    className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-1 rounded-md text-xs font-medium transition"
                  >
                    + Add Row
                  </button>
                </div>
                {getTimelineItems(draft).map((item, i) => (
                  <div
                    key={i}
                    className="bg-brown-dark/20 border border-gold-light/10 rounded-lg px-3 py-2 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gold-light/50 font-mono">Row {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = getTimelineItems(draft);
                          const next = cur.filter((_, idx) => idx !== i);
                          updateDraft("about_page.timeline_items", next.length ? next : undefined);
                        }}
                        className="text-[12px] text-gold-light/70 hover:text-red-300 transition"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="Year (e.g. 1985)"
                        value={item.year || ""}
                        onChange={(e) => {
                          const cur = getTimelineItems(draft);
                          cur[i] = { ...cur[i], year: e.target.value };
                          updateDraft("about_page.timeline_items", cur);
                        }}
                      />
                      <Input
                        placeholder="Label (e.g. BEGINNING)"
                        value={item.label || ""}
                        onChange={(e) => {
                          const cur = getTimelineItems(draft);
                          cur[i] = { ...cur[i], label: e.target.value };
                          updateDraft("about_page.timeline_items", cur);
                        }}
                      />
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Description..."
                      value={item.description || ""}
                      onChange={(e) => {
                        const cur = getTimelineItems(draft);
                        cur[i] = { ...cur[i], description: e.target.value };
                        updateDraft("about_page.timeline_items", cur);
                      }}
                    />
                  </div>
                ))}
                {getTimelineItems(draft).length === 0 && (
                  <p className="text-[12px] text-gold-light/50">
                    Leave empty to use the default 12 timeline rows.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Homepage — About Section"
              keys={["about.heading", "about.eyebrow", "about.body", "about.media_url", "about.cta_text", "about.cta_url"]}
            >
              <p className="text-xs text-gold-light/70 -mt-2 mb-3">
                These fields control the "About" section that appears on the homepage, not the /about page.
              </p>
              <Field label="Heading" dirty={isDirty("about.heading")}>
                <Input
                  value={(draft["about.heading"] as string) || ""}
                  onChange={(e) => updateDraft("about.heading", e.target.value)}
                  placeholder="A life learned,"
                />
              </Field>
              <Field label="Eyebrow" dirty={isDirty("about.eyebrow")}>
                <Input
                  value={(draft["about.eyebrow"] as string) || ""}
                  onChange={(e) => updateDraft("about.eyebrow", e.target.value)}
                  placeholder="Plastic Surgeon · Visionary · Author · Podcaster"
                />
              </Field>
              <Field label="Body" dirty={isDirty("about.body")}>
                <Textarea
                  rows={4}
                  value={(draft["about.body"] as string) || ""}
                  onChange={(e) => updateDraft("about.body", e.target.value)}
                  placeholder="Short paragraph for the homepage About section..."
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Hero CTA Text" dirty={isDirty("about.cta_text")}>
                  <Input
                    value={(draft["about.cta_text"] as string) || ""}
                    onChange={(e) => updateDraft("about.cta_text", e.target.value)}
                    placeholder="Read the memoir"
                  />
                  <p className="text-[12px] text-gold-light/70 mt-1">
                    Used for the hero button on the homepage.
                  </p>
                </Field>
                <Field label="Hero CTA URL" dirty={isDirty("about.cta_url")}>
                  <Input
                    value={(draft["about.cta_url"] as string) || ""}
                    onChange={(e) => updateDraft("about.cta_url", e.target.value)}
                    placeholder="/memoir"
                  />
                </Field>
              </div>
              <div>
                <label className="text-gold-pale font-semibold text-[15px] mb-2 block">
                  About Portrait (fallback for hero)
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => openPicker("about.media_url")}
                    className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-4 py-2.5 rounded-md text-[13px] font-medium transition border border-gold-light/10"
                  >
                    Pick from Media
                  </button>
                  <MediaThumb url={draft["about.media_url"] as string} />
                  {(draft["about.media_url"] as string) && (
                    <span className="text-[13px] text-gold-light truncate max-w-xs" title={(draft["about.media_url"] as string) || ""}>
                      {getAssetLabel((draft["about.media_url"] as string) || "") || "Media selected"}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-gold-light/70 mt-1.5">
                  Also used as a fallback portrait for the homepage hero if no hero author image is set.
                </p>
              </div>
            </SectionCard>
          </div>
        )}

        {activeSection === "Welcoming" && (
          <SectionCard
            title="Welcoming Section"
            keys={[
              "welcoming.eyebrow",
              "welcoming.title",
              "welcoming.body",
              "welcoming.quote",
              "welcoming.video_url",
              "welcoming.video_media_url",
              "welcoming.video_cover_url",
            ]}
          >
            <Field label="Eyebrow" dirty={isDirty("welcoming.eyebrow")}>
              <Textarea
                value={(draft["welcoming.eyebrow"] as string) || ""}
                onChange={(e) => updateDraft("welcoming.eyebrow", e.target.value)}
                placeholder="Welcome to Mindfulness To Change."
                rows={2}
              />
              <p className="text-xs text-gold-light/70 mt-1">
                Small uppercase label above the title. Use a new line to split across two lines.
              </p>
            </Field>
            <Field label="Title" dirty={isDirty("welcoming.title")}>
              <Input
                value={(draft["welcoming.title"] as string) || ""}
                onChange={(e) => updateDraft("welcoming.title", e.target.value)}
                placeholder="A short welcome heading"
              />
            </Field>
            <Field label="Body" dirty={isDirty("welcoming.body")}>
              <Textarea
                rows={5}
                value={(draft["welcoming.body"] as string) || ""}
                onChange={(e) => updateDraft("welcoming.body", e.target.value)}
                placeholder="A short welcome message shown next to the video..."
              />
            </Field>
            <Field label="Quote" dirty={isDirty("welcoming.quote")}>
              <Textarea
                rows={3}
                value={(draft["welcoming.quote"] as string) || ""}
                onChange={(e) => updateDraft("welcoming.quote", e.target.value)}
                placeholder='"Surely the LORD is in this place, and I was not aware of it." Genesis 28:16'
              />
            </Field>
            <Field label="YouTube Video URL" dirty={isDirty("welcoming.video_url")}>
              <Input
                value={(draft["welcoming.video_url"] as string) || ""}
                onChange={(e) =>
                  updateDraft("welcoming.video_url", e.target.value)
                }
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gold-light/70 mt-1">
                YouTube URL recommended. The thumbnail is auto-derived from a YouTube URL.
              </p>
            </Field>
            <div>
              <label className="text-gold-pale font-semibold text-[15px] mb-2 block">
                Internal Media Video
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => openPicker("welcoming.video_media_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-4 py-2.5 rounded-md text-[13px] font-medium transition border border-gold-light/10"
                >
                  Pick from Media
                </button>
                <MediaThumb url={draft["welcoming.video_media_url"] as string} />
                {(draft["welcoming.video_media_url"] as string) && (
                  <>
                    <span
                      className="text-[13px] text-gold-light truncate max-w-xs"
                      title={(draft["welcoming.video_media_url"] as string) || ""}
                    >
                      {getAssetLabel((draft["welcoming.video_media_url"] as string) || "") || "Media selected"}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateDraft("welcoming.video_media_url", "")}
                      className="text-[12px] text-gold-light/70 hover:text-red-300 transition"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
              <p className="text-[12px] text-gold-light/70 mt-1.5">
                Alternatively, pick a video file from the media library. If set, this takes precedence over the YouTube URL.
              </p>
            </div>
            <div>
              <label className="text-gold-pale font-semibold text-[15px] mb-2 block">
                Video Cover Image
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => openPicker("welcoming.video_cover_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-4 py-2.5 rounded-md text-[13px] font-medium transition border border-gold-light/10"
                >
                  Pick from Media
                </button>
                <MediaThumb url={draft["welcoming.video_cover_url"] as string} />
                {(draft["welcoming.video_cover_url"] as string) && (
                  <>
                    <span
                      className="text-[13px] text-gold-light truncate max-w-xs"
                      title={(draft["welcoming.video_cover_url"] as string) || ""}
                    >
                      {getAssetLabel((draft["welcoming.video_cover_url"] as string) || "") || "Cover selected"}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateDraft("welcoming.video_cover_url", "")}
                      className="text-[12px] text-gold-light/70 hover:text-red-300 transition"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
              <p className="text-[12px] text-gold-light/70 mt-1.5">
                Required for self-uploaded videos. Shown as the thumbnail before the user clicks play. YouTube URLs auto-generate their own cover.
              </p>
            </div>
          </SectionCard>
        )}

        {activeSection === "Books" && (
          <SectionCard
            title="Books Section"
            keys={["books.eyebrow", "books.title", "books.title_accent", "books.lead", "books.description", "books.cover_url", "books.cover_width", "books.cover_height", "books.buy_url", "books.buy_button_text"]}
          >
            <Field label="Eyebrow" dirty={isDirty("books.eyebrow")}>
              <Input
                value={(draft["books.eyebrow"] as string) || ""}
                onChange={(e) => updateDraft("books.eyebrow", e.target.value)}
                placeholder="A Plastic Surgeon’s Memoir"
              />
              <p className="text-xs text-gold-light/70 mt-1">
                Small uppercase label above the heading.
              </p>
            </Field>
            <Field label="Heading" dirty={isDirty("books.title")}>
              <Input
                value={(draft["books.title"] as string) || ""}
                onChange={(e) => updateDraft("books.title", e.target.value)}
                placeholder="I See You"
              />
            </Field>
            <Field label="Heading accent (italic, optional)" dirty={isDirty("books.title_accent")}>
              <Input
                value={(draft["books.title_accent"] as string) || ""}
                onChange={(e) => updateDraft("books.title_accent", e.target.value)}
                placeholder="e.g. to Life."
              />
              <p className="text-xs text-gold-light/70 mt-1">
                Optional second line shown in gold italic below the heading.
                Leave empty to hide it.
              </p>
            </Field>
            <Field label="Lead quote" dirty={isDirty("books.lead")}>
              <Textarea
                rows={3}
                value={(draft["books.lead"] as string) || ""}
                onChange={(e) => updateDraft("books.lead", e.target.value)}
                placeholder="A short italic pull-quote shown under the heading..."
              />
            </Field>
            <Field label="Description" dirty={isDirty("books.description")}>
              <Textarea
                rows={4}
                value={(draft["books.description"] as string) || ""}
                onChange={(e) => updateDraft("books.description", e.target.value)}
                placeholder="Describe the book..."
              />
            </Field>
            <div>
              <label className="text-gold-pale font-medium text-sm mb-1.5 block">Cover Image</label>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => openPicker("books.cover_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                >
                  Pick from Media
                </button>
                <MediaThumb url={draft["books.cover_url"] as string} />
                {(draft["books.cover_url"] as string) && (
                  <span className="text-xs text-gold-light truncate max-w-xs" title={(draft["books.cover_url"] as string) || ""}>
                    {getAssetLabel((draft["books.cover_url"] as string) || "") || "Cover selected"}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <button
                  onClick={() => setBooksSizeLocked((v) => !v)}
                  className="text-xs px-3 py-1.5 rounded border border-gold-light/20 text-gold-light hover:text-gold-pale bg-brown-dark/30"
                >
                  Link Width & Height: {booksSizeLocked ? "On" : "Off"}
                </button>
              </div>
              <Field label="Cover Width (px)" dirty={isDirty("books.cover_width")}>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={BOOKS_COVER_DEFAULTS.minWidth}
                    max={BOOKS_COVER_DEFAULTS.maxWidth}
                    step={1}
                    value={toSafeInt(((draft["books.cover_width"] as number) || BOOKS_COVER_DEFAULTS.width).toString(), BOOKS_COVER_DEFAULTS.width, BOOKS_COVER_DEFAULTS.minWidth, BOOKS_COVER_DEFAULTS.maxWidth)}
                    onChange={(e) => {
                      const value = toSafeInt(e.target.value, BOOKS_COVER_DEFAULTS.width, BOOKS_COVER_DEFAULTS.minWidth, BOOKS_COVER_DEFAULTS.maxWidth);
                      if (booksSizeLocked) {
                        updateLinkedSize("books.cover_width", "books.cover_height", value, null, BOOKS_COVER_DEFAULTS);
                      } else {
                        updateDraft("books.cover_width", value);
                      }
                    }}
                    className="w-full accent-gold-primary"
                  />
                  <Input
                    type="number"
                    min={BOOKS_COVER_DEFAULTS.minWidth}
                    max={BOOKS_COVER_DEFAULTS.maxWidth}
                    step={1}
                    value={toSafeInt(((draft["books.cover_width"] as number) || BOOKS_COVER_DEFAULTS.width).toString(), BOOKS_COVER_DEFAULTS.width, BOOKS_COVER_DEFAULTS.minWidth, BOOKS_COVER_DEFAULTS.maxWidth).toString()}
                    onChange={(e) => {
                      const value = toSafeInt(e.target.value, BOOKS_COVER_DEFAULTS.width, BOOKS_COVER_DEFAULTS.minWidth, BOOKS_COVER_DEFAULTS.maxWidth);
                      if (booksSizeLocked) {
                        updateLinkedSize("books.cover_width", "books.cover_height", value, null, BOOKS_COVER_DEFAULTS);
                      } else {
                        updateDraft("books.cover_width", value);
                      }
                    }}
                    className="w-24"
                  />
                </div>
              </Field>
              <Field label="Cover Height (px)" dirty={isDirty("books.cover_height")}>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={BOOKS_COVER_DEFAULTS.minHeight}
                    max={BOOKS_COVER_DEFAULTS.maxHeight}
                    step={1}
                    value={toSafeInt(((draft["books.cover_height"] as number) || BOOKS_COVER_DEFAULTS.height).toString(), BOOKS_COVER_DEFAULTS.height, BOOKS_COVER_DEFAULTS.minHeight, BOOKS_COVER_DEFAULTS.maxHeight)}
                    onChange={(e) => {
                      const value = toSafeInt(e.target.value, BOOKS_COVER_DEFAULTS.height, BOOKS_COVER_DEFAULTS.minHeight, BOOKS_COVER_DEFAULTS.maxHeight);
                      if (booksSizeLocked) {
                        updateLinkedSize("books.cover_width", "books.cover_height", null, value, BOOKS_COVER_DEFAULTS);
                      } else {
                        updateDraft("books.cover_height", value);
                      }
                    }}
                    className="w-full accent-gold-primary"
                  />
                  <Input
                    type="number"
                    min={BOOKS_COVER_DEFAULTS.minHeight}
                    max={BOOKS_COVER_DEFAULTS.maxHeight}
                    step={1}
                    value={toSafeInt(((draft["books.cover_height"] as number) || BOOKS_COVER_DEFAULTS.height).toString(), BOOKS_COVER_DEFAULTS.height, BOOKS_COVER_DEFAULTS.minHeight, BOOKS_COVER_DEFAULTS.maxHeight).toString()}
                    onChange={(e) => {
                      const value = toSafeInt(e.target.value, BOOKS_COVER_DEFAULTS.height, BOOKS_COVER_DEFAULTS.minHeight, BOOKS_COVER_DEFAULTS.maxHeight);
                      if (booksSizeLocked) {
                        updateLinkedSize("books.cover_width", "books.cover_height", null, value, BOOKS_COVER_DEFAULTS);
                      } else {
                        updateDraft("books.cover_height", value);
                      }
                    }}
                    className="w-24"
                  />
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Buy URL" dirty={isDirty("books.buy_url")}>
                <Input
                  value={(draft["books.buy_url"] as string) || ""}
                  onChange={(e) => updateDraft("books.buy_url", e.target.value)}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Button Text" dirty={isDirty("books.buy_button_text")}>
                <Input
                  value={(draft["books.buy_button_text"] as string) || ""}
                  onChange={(e) => updateDraft("books.buy_button_text", e.target.value)}
                  placeholder="Buy Now"
                />
              </Field>
            </div>
          </SectionCard>
        )}

        {activeSection === "Podcast" && (
          <SectionCard
            title="Podcast Section"
            keys={[
              "podcast.heading",
              "podcast.subheading",
              "podcast.spotlight_description",
              "podcast.spotlight_items",
              "podcast.episodes",
            ]}
          >
            <Field label="Heading" dirty={isDirty("podcast.heading")}>
              <Input
                value={(draft["podcast.heading"] as string) || ""}
                onChange={(e) => updateDraft("podcast.heading", e.target.value)}
                placeholder="APCOMM Podcast"
              />
            </Field>
            <Field label="Subheading" dirty={isDirty("podcast.subheading")}>
              <Input
                value={(draft["podcast.subheading"] as string) || ""}
                onChange={(e) => updateDraft("podcast.subheading", e.target.value)}
                placeholder="Conversations that inspire change"
              />
            </Field>
            <Field
              label="Spotlight description"
              dirty={isDirty("podcast.spotlight_description")}
            >
              <Textarea
                rows={3}
                value={(draft["podcast.spotlight_description"] as string) || ""}
                onChange={(e) =>
                  updateDraft("podcast.spotlight_description", e.target.value)
                }
                placeholder="Text shown beside the spotlight video"
              />
              <p className="text-xs text-gold-light/70 mt-1">
                Stays the same as the spotlight videos rotate.
              </p>
            </Field>

            <div className="border-t border-gold-light/10 pt-5">
              <div className="flex justify-between items-center mb-1">
                <label className="text-gold-pale font-medium text-sm">
                  Spotlight carousel ({getSpotlight(draft).length})
                </label>
                <button
                  onClick={() =>
                    updateDraft("podcast.spotlight_items", [
                      ...getSpotlight(draft),
                      { video_url: "" },
                    ])
                  }
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-1 rounded-md text-xs font-medium transition"
                >
                  + Add Video
                </button>
              </div>
              <p className="text-xs text-gold-light/70 mb-3">
                Featured “Now Playing” videos at the top of the podcast section.
                They auto-rotate every 10 seconds; clicking one opens an in-site
                popup player.
              </p>
              <div className="flex flex-col gap-4">
                {getSpotlight(draft).map((item, i) => (
                  <div
                    key={i}
                    className="border border-gold-light/10 rounded-lg p-4 bg-brown-dark/20"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gold-pale">
                        Video {i + 1}
                      </span>
                      <button
                        onClick={() => {
                          const next = getSpotlight(draft).filter((_, j) => j !== i);
                          updateDraft("podcast.spotlight_items", next);
                        }}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                    <Input
                      placeholder="Video URL (https://www.youtube.com/watch?v=...)"
                      value={item.video_url}
                      onChange={(e) => {
                        const next = [...getSpotlight(draft)];
                        next[i] = { ...next[i], video_url: e.target.value };
                        updateDraft("podcast.spotlight_items", next);
                      }}
                    />
                  </div>
                ))}
                {getSpotlight(draft).length === 0 && (
                  <p className="text-xs text-gold-light/60">
                    No spotlight videos yet — click “+ Add Video”.
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-gold-pale font-medium text-sm">Episodes ({getEpisodes(draft).length})</label>
                <button
                  onClick={() =>
                    updateDraft("podcast.episodes", [
                      ...getEpisodes(draft),
                      { title: "", thumbnail_media_id: null, video_url: "", duration: "", description: "" },
                    ])
                  }
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-1 rounded-md text-xs font-medium transition"
                >
                  + Add Episode
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {getEpisodes(draft).map((ep, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={(e) => {
                      setEpDragIndex(i);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(i));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (epDragOverIndex !== i) setEpDragOverIndex(i);
                    }}
                    onDragLeave={() => {
                      if (epDragOverIndex === i) setEpDragOverIndex(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const raw =
                        epDragIndex !== null
                          ? epDragIndex
                          : Number(e.dataTransfer.getData("text/plain"));
                      if (!Number.isNaN(raw) && raw !== i) {
                        const list = [...getEpisodes(draft)];
                        const [item] = list.splice(raw, 1);
                        list.splice(i, 0, item);
                        updateDraft("podcast.episodes", list);
                      }
                      setEpDragIndex(null);
                      setEpDragOverIndex(null);
                    }}
                    onDragEnd={() => {
                      setEpDragIndex(null);
                      setEpDragOverIndex(null);
                    }}
                    className={`border border-gold-light/10 rounded-lg p-4 bg-brown-dark/20 transition ${
                      epDragIndex === i ? "opacity-50" : ""
                    } ${
                      epDragOverIndex === i &&
                      epDragIndex !== null &&
                      epDragIndex !== i
                        ? "ring-2 ring-gold-light/50"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="flex items-center gap-2 text-sm font-medium text-gold-pale">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                          className="text-gold-light/70 cursor-grab active:cursor-grabbing"
                        >
                          <circle cx="9" cy="6" r="1.6" />
                          <circle cx="15" cy="6" r="1.6" />
                          <circle cx="9" cy="12" r="1.6" />
                          <circle cx="15" cy="12" r="1.6" />
                          <circle cx="9" cy="18" r="1.6" />
                          <circle cx="15" cy="18" r="1.6" />
                        </svg>
                        Episode {i + 1}
                      </span>
                      <button
                        onClick={() => {
                          const next = [...getEpisodes(draft)];
                          next.splice(i, 1);
                          updateDraft("podcast.episodes", next);
                        }}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <Input
                        placeholder="Title"
                        value={ep.title}
                        onChange={(e) => {
                          const next = [...getEpisodes(draft)];
                          next[i] = { ...next[i], title: e.target.value };
                          updateDraft("podcast.episodes", next);
                        }}
                      />
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => openPicker(`podcast.episodes.${i}.thumbnail_media_id`)}
                          className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                        >
                          Pick Thumbnail
                        </button>
                        <MediaThumb url={ep.thumbnail_media_id} size={36} />
                        {ep.thumbnail_media_id && (
                          <span className="text-xs text-gold-light">{ep.thumbnail_media_id}</span>
                        )}
                      </div>
                      <Input
                        placeholder="Video URL"
                        value={ep.video_url}
                        onChange={(e) => {
                          const next = [...getEpisodes(draft)];
                          next[i] = { ...next[i], video_url: e.target.value };
                          updateDraft("podcast.episodes", next);
                        }}
                      />
                      <Input
                        placeholder="Duration (e.g. 12:34)"
                        value={ep.duration}
                        onChange={(e) => {
                          const next = [...getEpisodes(draft)];
                          next[i] = { ...next[i], duration: e.target.value };
                          updateDraft("podcast.episodes", next);
                        }}
                      />
                      <Textarea
                        placeholder="Description"
                        rows={2}
                        value={ep.description}
                        onChange={(e) => {
                          const next = [...getEpisodes(draft)];
                          next[i] = { ...next[i], description: e.target.value };
                          updateDraft("podcast.episodes", next);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {activeSection === "Showcase" && (
          <SectionCard
            title="Showcase Section"
            keys={[
              "showcase.title",
              "showcase.items",
              "showcase.cover_url",
            ]}
          >
            <Field label="Title" dirty={isDirty("showcase.title")}>
              <Input
                value={(draft["showcase.title"] as string) || ""}
                onChange={(e) => updateDraft("showcase.title", e.target.value)}
                placeholder="Featured Videos"
              />
            </Field>
            <Field label="Fallback cover" dirty={isDirty("showcase.cover_url")}>
              <div className="flex items-center gap-3">
                <MediaThumb url={(draft["showcase.cover_url"] as string) || ""} />
                <button
                  onClick={() => openPicker("showcase.cover_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                >
                  Pick Cover
                </button>
              </div>
            </Field>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-gold-pale font-medium text-sm">
                  Videos ({getShowcaseItems(draft).length})
                </label>
                <button
                  onClick={() =>
                    updateDraft("showcase.items", [
                      ...getShowcaseItems(draft),
                      { video_url: "" },
                    ])
                  }
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                >
                  + Add video
                </button>
              </div>
              <p className="text-xs text-gold-light/70 mb-3">
                Featured videos in the showcase grid. Each card shows a thumbnail,
                title, description, and a "Find Out More" button that opens a
                newsletter signup popup before playing the video.
              </p>
              {(() => {
                const items = getShowcaseItems(draft);
                const display = items.length > 0 ? items : [{ video_url: "" }];
                const isPlaceholder = items.length === 0;
                return display.map((item, i) => (
                  <div
                    key={i}
                    className="space-y-3 bg-brown-dark/20 border border-gold-light/10 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gold-pale">
                        {isPlaceholder ? "New Video" : `Video ${i + 1}`}
                      </span>
                      {!isPlaceholder && (
                        <button
                          onClick={() => {
                            const next = getShowcaseItems(draft).filter((_, j) => j !== i);
                            updateDraft("showcase.items", next);
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="YouTube or video URL"
                      value={item.video_url || ""}
                      onChange={(e) => {
                        if (isPlaceholder) {
                          updateDraft("showcase.items", [{ video_url: e.target.value }]);
                        } else {
                          const next = [...getShowcaseItems(draft)];
                          next[i] = { ...next[i], video_url: e.target.value };
                          updateDraft("showcase.items", next);
                        }
                      }}
                    />
                    <Input
                      placeholder="Title (e.g. APCOMM 2027)"
                      value={item.title || ""}
                      onChange={(e) => {
                        if (isPlaceholder) {
                          updateDraft("showcase.items", [{ video_url: "", title: e.target.value }]);
                        } else {
                          const next = [...getShowcaseItems(draft)];
                          next[i] = { ...next[i], title: e.target.value };
                          updateDraft("showcase.items", next);
                        }
                      }}
                    />
                    <Textarea
                      placeholder="Short description shown under the thumbnail..."
                      rows={2}
                      value={item.description || ""}
                      onChange={(e) => {
                        if (isPlaceholder) {
                          updateDraft("showcase.items", [{ video_url: "", description: e.target.value }]);
                        } else {
                          const next = [...getShowcaseItems(draft)];
                          next[i] = { ...next[i], description: e.target.value };
                          updateDraft("showcase.items", next);
                        }
                      }}
                    />
                  </div>
                ));
              })()}
            </div>
          </SectionCard>
        )}

        {activeSection === "Events" && (
          <SectionCard
            title="Events Section"
            keys={[
              "events.heading",
              "events.body",
              "book_promo.enabled",
              "book_promo.image_1_url",
              "book_promo.image_2_url",
              "book_promo.image_3_url",
              "book_promo.title_line1",
              "book_promo.title_line2",
              "book_promo.body",
              "book_promo.cta_text",
            ]}
          >
            <Field label="Heading" dirty={isDirty("events.heading")}>
              <Textarea
                rows={3}
                value={(draft["events.heading"] as string) || ""}
                onChange={(e) => updateDraft("events.heading", e.target.value)}
                placeholder="In a <span class='italic-accent'>room,</span><br>together."
              />
              <p className="text-xs text-gold-light/70 mt-1">
                Supports HTML. Use <code className="text-gold-primary bg-brown-dark/60 px-1 rounded">&lt;br&gt;</code> for line breaks and <code className="text-gold-primary bg-brown-dark/60 px-1 rounded">&lt;span class='italic-accent'&gt;</code> for gold italic text. Leave empty to use the default.
              </p>
            </Field>
            <Field label="Body" dirty={isDirty("events.body")}>
              <Textarea
                rows={4}
                value={(draft["events.body"] as string) || ""}
                onChange={(e) => updateDraft("events.body", e.target.value)}
                placeholder="Charles teaches a small number of in-person retreats and lectures each year. Seats open here first."
              />
            </Field>

            <div className="border-t border-gold-light/10 pt-6 mt-4">
              <p className="text-sm font-medium text-gold-pale mb-4">Free book promo (shown under the featured event)</p>
              <div className="flex items-center gap-3 mb-4">
                <label className="inline-flex items-center gap-2 text-gold-light text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(draft["book_promo.enabled"] as boolean) ?? true}
                    onChange={(e) => updateDraft("book_promo.enabled", e.target.checked)}
                    className="accent-gold-primary"
                  />
                  Show free book promo
                </label>
                {isDirty("book_promo.enabled") && (
                  <span className="text-[10px] bg-gold-primary/20 text-gold-light px-1.5 py-0.5 rounded">
                    modified
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { key: "book_promo.image_1_url", label: "Book Cover Image" },
                  { key: "book_promo.image_2_url", label: "Contents / Table of Contents Image" },
                  { key: "book_promo.image_3_url", label: "Interior Page Image" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-gold-pale font-medium text-sm mb-1.5 block">{label}</label>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => openPicker(key)}
                        className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                      >
                        Pick from Media
                      </button>
                      <MediaThumb url={draft[key] as string} />
                      {(draft[key] as string) && (
                        <>
                          <span
                            className="text-xs text-gold-light truncate max-w-xs"
                            title={(draft[key] as string) || ""}
                          >
                            {getAssetLabel((draft[key] as string) || "") || "Image selected"}
                          </span>
                          <button
                            onClick={() => updateDraft(key, "")}
                            className="text-red-300 hover:text-red-200 text-xs underline"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Field label="Promo Title Line 1" dirty={isDirty("book_promo.title_line1")}>
                  <Input
                    value={(draft["book_promo.title_line1"] as string) || ""}
                    onChange={(e) => updateDraft("book_promo.title_line1", e.target.value)}
                    placeholder="A free book"
                  />
                </Field>
                <Field label="Promo Title Line 2" dirty={isDirty("book_promo.title_line2")}>
                  <Input
                    value={(draft["book_promo.title_line2"] as string) || ""}
                    onChange={(e) => updateDraft("book_promo.title_line2", e.target.value)}
                    placeholder="for early birds"
                  />
                </Field>
              </div>
              <Field label="Promo Body" dirty={isDirty("book_promo.body")}>
                <Textarea
                  rows={3}
                  value={(draft["book_promo.body"] as string) || ""}
                  onChange={(e) => updateDraft("book_promo.body", e.target.value)}
                  placeholder="Enter your email below and receive a free digital copy of the book on Christian Mindfulness, plus reserve an early bird seat for the next conversation."
                />
              </Field>
              <Field label="Button Text" dirty={isDirty("book_promo.cta_text")}>
                <Input
                  value={(draft["book_promo.cta_text"] as string) || ""}
                  onChange={(e) => updateDraft("book_promo.cta_text", e.target.value)}
                  placeholder="Get the free book & reserve a seat"
                />
              </Field>
            </div>
          </SectionCard>
        )}

        {activeSection === "Memoir" && (
          <div className="space-y-8">
            <SectionCard title="Hero" keys={["memoir.hero_label", "memoir.hero_title", "memoir.hero_subtitle"]}>
              <Field label="Label" dirty={isDirty("memoir.hero_label")}>
                <Input
                  value={(draft["memoir.hero_label"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.hero_label", e.target.value)}
                  placeholder="A Story of Transformation"
                />
              </Field>
              <Field label="Title" dirty={isDirty("memoir.hero_title")}>
                <Input
                  value={(draft["memoir.hero_title"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.hero_title", e.target.value)}
                  placeholder="My Memoir"
                />
              </Field>
              <Field label="Subtitle" dirty={isDirty("memoir.hero_subtitle")}>
                <Input
                  value={(draft["memoir.hero_subtitle"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.hero_subtitle", e.target.value)}
                  placeholder="by Dr. Charles Lee"
                />
              </Field>
            </SectionCard>

            <SectionCard title="Quote" keys={["memoir.quote.text", "memoir.quote.attribution"]}>
              <Field label="Quote Text" dirty={isDirty("memoir.quote.text")}>
                <Textarea
                  rows={3}
                  value={(draft["memoir.quote.text"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.quote.text", e.target.value)}
                  placeholder="Success is not what you achieve..."
                />
              </Field>
              <Field label="Attribution" dirty={isDirty("memoir.quote.attribution")}>
                <Input
                  value={(draft["memoir.quote.attribution"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.quote.attribution", e.target.value)}
                  placeholder="Dr. Charles Lee"
                />
              </Field>
            </SectionCard>

            <SectionCard title="MindFlow" keys={["memoir.mindflow.heading", "memoir.mindflow.description", "memoir.mindflow.youtube_url"]}>
              <Field label="Heading" dirty={isDirty("memoir.mindflow.heading")}>
                <Input
                  value={(draft["memoir.mindflow.heading"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.mindflow.heading", e.target.value)}
                  placeholder="MindFlow Ergonomics"
                />
              </Field>
              <Field label="Description" dirty={isDirty("memoir.mindflow.description")}>
                <Textarea
                  rows={4}
                  value={(draft["memoir.mindflow.description"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.mindflow.description", e.target.value)}
                />
              </Field>
              <Field label="YouTube Channel URL" dirty={isDirty("memoir.mindflow.youtube_url")}>
                <Input
                  value={(draft["memoir.mindflow.youtube_url"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.mindflow.youtube_url", e.target.value)}
                  placeholder="https://www.youtube.com/@hearttalk-drcharleslee"
                />
              </Field>
            </SectionCard>

            <SectionCard title="Zones" keys={["memoir.zones.heading", "memoir.zones.subheading", "memoir.zones.items"]}>
              <Field label="Heading" dirty={isDirty("memoir.zones.heading")}>
                <Input
                  value={(draft["memoir.zones.heading"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.zones.heading", e.target.value)}
                  placeholder="The 7 C.R.E.A.T.I.V.E. Zones"
                />
              </Field>
              <Field label="Subheading" dirty={isDirty("memoir.zones.subheading")}>
                <Input
                  value={(draft["memoir.zones.subheading"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.zones.subheading", e.target.value)}
                  placeholder="MindFlow Ergonomics Assessment"
                />
              </Field>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-gold-pale font-medium text-sm">Zones ({getMemoirZones(draft).length})</label>
                  <button
                    onClick={() =>
                      updateDraft("memoir.zones.items", [
                        ...getMemoirZones(draft),
                        { letter: "", word: "", desc: "" },
                      ])
                    }
                    className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-1 rounded-md text-xs font-medium transition"
                  >
                    + Add Zone
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {getMemoirZones(draft).map((zone, i) => (
                    <div key={i} className="border border-gold-light/10 rounded-lg p-4 bg-brown-dark/20">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gold-pale">Zone {i + 1}</span>
                        <button
                          onClick={() => {
                            const next = [...getMemoirZones(draft)];
                            next.splice(i, 1);
                            updateDraft("memoir.zones.items", next);
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <Input
                          placeholder="Letter (e.g. C)"
                          value={zone.letter}
                          onChange={(e) => {
                            const next = [...getMemoirZones(draft)];
                            next[i] = { ...next[i], letter: e.target.value };
                            updateDraft("memoir.zones.items", next);
                          }}
                        />
                        <Input
                          placeholder="Word (e.g. Creativity)"
                          value={zone.word}
                          onChange={(e) => {
                            const next = [...getMemoirZones(draft)];
                            next[i] = { ...next[i], word: e.target.value };
                            updateDraft("memoir.zones.items", next);
                          }}
                        />
                        <Textarea
                          placeholder="Description"
                          rows={2}
                          value={zone.desc}
                          onChange={(e) => {
                            const next = [...getMemoirZones(draft)];
                            next[i] = { ...next[i], desc: e.target.value };
                            updateDraft("memoir.zones.items", next);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="HEARTtalk CTA" keys={["memoir.hearttalk.heading", "memoir.hearttalk.description", "memoir.hearttalk.youtube_url"]}>
              <Field label="Heading" dirty={isDirty("memoir.hearttalk.heading")}>
                <Input
                  value={(draft["memoir.hearttalk.heading"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.hearttalk.heading", e.target.value)}
                  placeholder="HEARTtalk with Dr. Charles Lee"
                />
              </Field>
              <Field label="Description" dirty={isDirty("memoir.hearttalk.description")}>
                <Textarea
                  rows={3}
                  value={(draft["memoir.hearttalk.description"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.hearttalk.description", e.target.value)}
                />
              </Field>
              <Field label="YouTube Channel URL" dirty={isDirty("memoir.hearttalk.youtube_url")}>
                <Input
                  value={(draft["memoir.hearttalk.youtube_url"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.hearttalk.youtube_url", e.target.value)}
                  placeholder="https://www.youtube.com/@hearttalk-drcharleslee"
                />
              </Field>
            </SectionCard>

            <SectionCard title="Video Episodes" keys={["memoir.videos.heading", "memoir.videos.subheading", "memoir.videos.items"]}>
              <Field label="Heading" dirty={isDirty("memoir.videos.heading")}>
                <Input
                  value={(draft["memoir.videos.heading"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.videos.heading", e.target.value)}
                  placeholder="A Pilgrimage of Writing My Memoir"
                />
              </Field>
              <Field label="Subheading" dirty={isDirty("memoir.videos.subheading")}>
                <Input
                  value={(draft["memoir.videos.subheading"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.videos.subheading", e.target.value)}
                  placeholder="HEARTtalk with Dr. Charles Lee"
                />
              </Field>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-gold-pale font-medium text-sm">Videos ({getMemoirVideos(draft).length})</label>
                  <button
                    onClick={() =>
                      updateDraft("memoir.videos.items", [
                        ...getMemoirVideos(draft),
                        { title: "", youtube_id: "" },
                      ])
                    }
                    className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-1 rounded-md text-xs font-medium transition"
                  >
                    + Add Video
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {getMemoirVideos(draft).map((video, i) => (
                    <div key={i} className="border border-gold-light/10 rounded-lg p-4 bg-brown-dark/20">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gold-pale">Video {i + 1}</span>
                        <button
                          onClick={() => {
                            const next = [...getMemoirVideos(draft)];
                            next.splice(i, 1);
                            updateDraft("memoir.videos.items", next);
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <Input
                          placeholder="Title"
                          value={video.title}
                          onChange={(e) => {
                            const next = [...getMemoirVideos(draft)];
                            next[i] = { ...next[i], title: e.target.value };
                            updateDraft("memoir.videos.items", next);
                          }}
                        />
                        <Input
                          placeholder="YouTube Video ID (e.g. 7ZZe70L-ngA)"
                          value={video.youtube_id}
                          onChange={(e) => {
                            const next = [...getMemoirVideos(draft)];
                            next[i] = { ...next[i], youtube_id: e.target.value };
                            updateDraft("memoir.videos.items", next);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Guest Memoirists" keys={["memoir.guests.heading", "memoir.guests.description", "memoir.guests.youtube_url"]}>
              <Field label="Heading" dirty={isDirty("memoir.guests.heading")}>
                <Input
                  value={(draft["memoir.guests.heading"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.guests.heading", e.target.value)}
                  placeholder="Guest Memoirists"
                />
              </Field>
              <Field label="Description" dirty={isDirty("memoir.guests.description")}>
                <Textarea
                  rows={3}
                  value={(draft["memoir.guests.description"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.guests.description", e.target.value)}
                />
              </Field>
              <Field label="YouTube Channel URL" dirty={isDirty("memoir.guests.youtube_url")}>
                <Input
                  value={(draft["memoir.guests.youtube_url"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.guests.youtube_url", e.target.value)}
                  placeholder="https://www.youtube.com/@hearttalk-drcharleslee"
                />
              </Field>
            </SectionCard>

            <SectionCard title="Orwell Quote" keys={["memoir.orwell_quote.text", "memoir.orwell_quote.attribution"]}>
              <Field label="Quote Text" dirty={isDirty("memoir.orwell_quote.text")}>
                <Textarea
                  rows={3}
                  value={(draft["memoir.orwell_quote.text"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.orwell_quote.text", e.target.value)}
                  placeholder="Perhaps one did not want to be loved so much as to be understood."
                />
              </Field>
              <Field label="Attribution" dirty={isDirty("memoir.orwell_quote.attribution")}>
                <Input
                  value={(draft["memoir.orwell_quote.attribution"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.orwell_quote.attribution", e.target.value)}
                  placeholder="George Orwell"
                />
              </Field>
            </SectionCard>

            <SectionCard title="Closing CTA" keys={["memoir.closing.heading", "memoir.closing.description", "memoir.closing.cta_text", "memoir.closing.cta_url"]}>
              <Field label="Heading" dirty={isDirty("memoir.closing.heading")}>
                <Input
                  value={(draft["memoir.closing.heading"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.closing.heading", e.target.value)}
                  placeholder="Begin Your Journey"
                />
              </Field>
              <Field label="Description" dirty={isDirty("memoir.closing.description")}>
                <Textarea
                  rows={3}
                  value={(draft["memoir.closing.description"] as string) || ""}
                  onChange={(e) => updateDraft("memoir.closing.description", e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="CTA Text" dirty={isDirty("memoir.closing.cta_text")}>
                  <Input
                    value={(draft["memoir.closing.cta_text"] as string) || ""}
                    onChange={(e) => updateDraft("memoir.closing.cta_text", e.target.value)}
                    placeholder="Get in Touch"
                  />
                </Field>
                <Field label="CTA URL" dirty={isDirty("memoir.closing.cta_url")}>
                  <Input
                    value={(draft["memoir.closing.cta_url"] as string) || ""}
                    onChange={(e) => updateDraft("memoir.closing.cta_url", e.target.value)}
                    placeholder="/contact"
                  />
                </Field>
              </div>
            </SectionCard>
          </div>
        )}

        {activeSection === "Contact" && (
          <SectionCard
            title="Contact Page"
            keys={["contact.destination_email", "contact.signature_url", "contact.signature_width", "contact.signature_x", "contact.signature_y"]}
          >
            <Field
              label="Destination email"
              dirty={isDirty("contact.destination_email")}
            >
              <Input
                type="email"
                value={(draft["contact.destination_email"] as string) || ""}
                onChange={(e) =>
                  updateDraft("contact.destination_email", e.target.value)
                }
                placeholder="charles@mindfulnesstochange.com"
              />
              <p className="text-xs text-gold-light/70 mt-1">
                Where messages submitted through the contact form are delivered.
                The site sends this address with every submission so your backend
                can route the email accordingly.
              </p>
            </Field>

            <div className="border-t border-gold-light/10 pt-4 mt-4">
              <label className="text-gold-pale font-medium text-sm mb-1.5 block">Signature Image</label>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => openPicker("contact.signature_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                >
                  Pick from Media
                </button>
                <MediaThumb url={draft["contact.signature_url"] as string} />
                {(draft["contact.signature_url"] as string) && (
                  <button
                    onClick={() => updateDraft("contact.signature_url", "")}
                    className="text-red-300 hover:text-red-200 text-xs underline"
                  >
                    Remove Signature
                  </button>
                )}
                {(draft["contact.signature_url"] as string) && (
                  <span
                    className="text-xs text-gold-light truncate max-w-xs"
                    title={(draft["contact.signature_url"] as string) || ""}
                  >
                    {getAssetLabel((draft["contact.signature_url"] as string) || "") || "Signature selected"}
                  </span>
                )}
              </div>
              <p className="text-xs text-gold-light/70 mt-2">
                Displayed below the contact details on the /contact page. Upload a transparent PNG for best results.
              </p>

              <Field label={`Signature Width (${(draft["contact.signature_width"] as number) || 220}px)`} dirty={isDirty("contact.signature_width")}>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={60}
                    max={2000}
                    step={1}
                    value={(draft["contact.signature_width"] as number) || 220}
                    onChange={(e) => updateDraft("contact.signature_width", parseInt(e.target.value, 10))}
                    className="w-full accent-gold-primary"
                  />
                  <Input
                    type="number"
                    min={60}
                    max={2000}
                    step={1}
                    value={((draft["contact.signature_width"] as number) || 220).toString()}
                    onChange={(e) => updateDraft("contact.signature_width", parseInt(e.target.value, 10) || 220)}
                    className="w-24"
                  />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <Field label={`Horizontal Offset (${(draft["contact.signature_x"] as number) || 0}px)`} dirty={isDirty("contact.signature_x")}>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={-500}
                      max={500}
                      step={1}
                      value={(draft["contact.signature_x"] as number) || 0}
                      onChange={(e) => updateDraft("contact.signature_x", parseInt(e.target.value, 10))}
                      className="w-full accent-gold-primary"
                    />
                    <Input
                      type="number"
                      min={-500}
                      max={500}
                      step={1}
                      value={((draft["contact.signature_x"] as number) || 0).toString()}
                      onChange={(e) => updateDraft("contact.signature_x", parseInt(e.target.value, 10) || 0)}
                      className="w-24"
                    />
                  </div>
                </Field>
                <Field label={`Vertical Offset (${(draft["contact.signature_y"] as number) || 0}px)`} dirty={isDirty("contact.signature_y")}>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={-300}
                      max={300}
                      step={1}
                      value={(draft["contact.signature_y"] as number) || 0}
                      onChange={(e) => updateDraft("contact.signature_y", parseInt(e.target.value, 10))}
                      className="w-full accent-gold-primary"
                    />
                    <Input
                      type="number"
                      min={-300}
                      max={300}
                      step={1}
                      value={((draft["contact.signature_y"] as number) || 0).toString()}
                      onChange={(e) => updateDraft("contact.signature_y", parseInt(e.target.value, 10) || 0)}
                      className="w-24"
                    />
                  </div>
                </Field>
              </div>
            </div>
          </SectionCard>
        )}

        {activeSection === "Newsletter" && (
          <SectionCard
            title="Newsletter Section"
            keys={[
              "newsletter.image_url",
              "newsletter.square_image_url",
              "newsletter.eyebrow",
              "newsletter.heading",
              "newsletter.italic_accent",
              "newsletter.body",
              "newsletter.footnote",
            ]}
          >
            <Field label="Image" dirty={isDirty("newsletter.image_url")}>
              <div className="flex items-center gap-3">
                <MediaThumb url={(draft["newsletter.image_url"] as string) || ""} />
                <button
                  onClick={() => openPicker("newsletter.image_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                >
                  Pick Image
                </button>
              </div>
            </Field>
            <Field label="Square media" dirty={isDirty("newsletter.square_image_url")}>
              <div className="flex items-center gap-3 flex-wrap">
                <MediaThumb url={(draft["newsletter.square_image_url"] as string) || ""} />
                <button
                  onClick={() => openPicker("newsletter.square_image_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                >
                  Pick Image
                </button>
                {(draft["newsletter.square_image_url"] as string) && (
                  <>
                    <span
                      className="text-xs text-gold-light truncate max-w-xs"
                      title={(draft["newsletter.square_image_url"] as string) || ""}
                    >
                      {getAssetLabel((draft["newsletter.square_image_url"] as string) || "") || "Square media selected"}
                    </span>
                    <button
                      onClick={() => updateDraft("newsletter.square_image_url", "")}
                      className="text-red-300 hover:text-red-200 text-xs underline"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
              <p className="text-[12px] text-gold-light/70 mt-1.5">
                Transparent square image shown beside the section eyebrow.
              </p>
            </Field>
            <Field label="Eyebrow" dirty={isDirty("newsletter.eyebrow")}>
              <Input
                value={(draft["newsletter.eyebrow"] as string) || ""}
                onChange={(e) => updateDraft("newsletter.eyebrow", e.target.value)}
                placeholder="Letters from the practice"
              />
            </Field>
            <Field label="Heading" dirty={isDirty("newsletter.heading")}>
              <Input
                value={(draft["newsletter.heading"] as string) || ""}
                onChange={(e) => updateDraft("newsletter.heading", e.target.value)}
                placeholder="Sundays,"
              />
            </Field>
            <Field label="Italic accent" dirty={isDirty("newsletter.italic_accent")}>
              <Input
                value={(draft["newsletter.italic_accent"] as string) || ""}
                onChange={(e) => updateDraft("newsletter.italic_accent", e.target.value)}
                placeholder="slowly"
              />
            </Field>
            <Field label="Body" dirty={isDirty("newsletter.body")}>
              <Textarea
                rows={3}
                value={(draft["newsletter.body"] as string) || ""}
                onChange={(e) => updateDraft("newsletter.body", e.target.value)}
                placeholder="A short letter most Sundays..."
              />
            </Field>
            <Field label="Footnote" dirty={isDirty("newsletter.footnote")}>
              <Input
                value={(draft["newsletter.footnote"] as string) || ""}
                onChange={(e) => updateDraft("newsletter.footnote", e.target.value)}
                placeholder="Joined by 31,847 quiet readers · since November 2019"
              />
            </Field>
          </SectionCard>
        )}

        {activeSection === "Footer" && (
          <SectionCard
            title="Footer"
            keys={[
              "footer.brand",
              "footer.tagline",
              "footer.copyright",
              "footer.powered_by",
              "footer.contact_url",
              "footer.social_links",
            ]}
          >
            <Field label="Brand Name" dirty={isDirty("footer.brand")}>
              <Input
                value={(draft["footer.brand"] as string) || ""}
                onChange={(e) => updateDraft("footer.brand", e.target.value)}
                placeholder="Charles Lee"
              />
            </Field>
            <Field label="Tagline" dirty={isDirty("footer.tagline")}>
              <Input
                value={(draft["footer.tagline"] as string) || ""}
                onChange={(e) => updateDraft("footer.tagline", e.target.value)}
                placeholder="Founder of the Asia Pacific Consultation On Marketplace Mindfulness, APCOMM."
              />
            </Field>
            <Field label="Copyright" dirty={isDirty("footer.copyright")}>
              <Input
                value={(draft["footer.copyright"] as string) || ""}
                onChange={(e) => updateDraft("footer.copyright", e.target.value)}
                placeholder="Copyright © 2026"
              />
            </Field>
            <Field label="Powered By" dirty={isDirty("footer.powered_by")}>
              <Input
                value={(draft["footer.powered_by"] as string) || ""}
                onChange={(e) => updateDraft("footer.powered_by", e.target.value)}
                placeholder="Powered by ZYT"
              />
            </Field>
            <Field label="Contact URL" dirty={isDirty("footer.contact_url")}>
              <Input
                value={(draft["footer.contact_url"] as string) || ""}
                onChange={(e) => updateDraft("footer.contact_url", e.target.value)}
                placeholder="/contact"
              />
              <p className="text-xs text-gold-light/70 mt-1">
                Used in the Listen & Attend column of the footer.
              </p>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Facebook" dirty={isDirty("footer.social_links")}>
                <Input
                  value={getSocialUrl(draft, "Facebook")}
                  onChange={(e) => updateDraft("footer.social_links", setSocialUrl(draft, "Facebook", e.target.value))}
                  placeholder="https://facebook.com/..."
                />
              </Field>
              <Field label="Instagram" dirty={isDirty("footer.social_links")}>
                <Input
                  value={getSocialUrl(draft, "Instagram")}
                  onChange={(e) => updateDraft("footer.social_links", setSocialUrl(draft, "Instagram", e.target.value))}
                  placeholder="https://instagram.com/..."
                />
              </Field>
              <Field label="YouTube" dirty={isDirty("footer.social_links")}>
                <Input
                  value={getSocialUrl(draft, "YouTube")}
                  onChange={(e) => updateDraft("footer.social_links", setSocialUrl(draft, "YouTube", e.target.value))}
                  placeholder="https://youtube.com/@..."
                />
              </Field>
              <Field label="X (Twitter)" dirty={isDirty("footer.social_links")}>
                <Input
                  value={getSocialUrl(draft, "X")}
                  onChange={(e) => updateDraft("footer.social_links", setSocialUrl(draft, "X", e.target.value))}
                  placeholder="https://x.com/..."
                />
              </Field>
              <Field label="LinkedIn" dirty={isDirty("footer.social_links")}>
                <Input
                  value={getSocialUrl(draft, "LinkedIn")}
                  onChange={(e) => updateDraft("footer.social_links", setSocialUrl(draft, "LinkedIn", e.target.value))}
                  placeholder="https://linkedin.com/in/..."
                />
              </Field>
              <Field label="TikTok" dirty={isDirty("footer.social_links")}>
                <Input
                  value={getSocialUrl(draft, "TikTok")}
                  onChange={(e) => updateDraft("footer.social_links", setSocialUrl(draft, "TikTok", e.target.value))}
                  placeholder="https://tiktok.com/@..."
                />
              </Field>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-gold-pale font-medium text-sm">Other Social Links</label>
                <button
                  onClick={() =>
                    updateDraft("footer.social_links", [...getSocialLinks(draft), { platform: "", url: "" }])
                  }
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-1 rounded-md text-xs font-medium transition"
                >
                  + Add Link
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {getSocialLinks(draft)
                  .filter((link) => !["facebook", "instagram", "youtube", "x", "linkedin", "tiktok"].includes(link.platform.toLowerCase()))
                  .map((link, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        placeholder="Platform"
                        value={link.platform}
                        onChange={(e) => {
                          const next = [...getSocialLinks(draft)];
                          const all = getSocialLinks(draft);
                          const filtered = all.filter(
                            (l) => !["facebook", "instagram", "youtube", "x", "linkedin", "tiktok"].includes(l.platform.toLowerCase())
                          );
                          filtered[i] = { ...filtered[i], platform: e.target.value };
                          updateDraft("footer.social_links", [
                            ...all.filter((l) => ["facebook", "instagram", "youtube", "x", "linkedin", "tiktok"].includes(l.platform.toLowerCase())),
                            ...filtered,
                          ]);
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => {
                          const all = getSocialLinks(draft);
                          const filtered = all.filter(
                            (l) => !["facebook", "instagram", "youtube", "x", "linkedin", "tiktok"].includes(l.platform.toLowerCase())
                          );
                          filtered[i] = { ...filtered[i], url: e.target.value };
                          updateDraft("footer.social_links", [
                            ...all.filter((l) => ["facebook", "instagram", "youtube", "x", "linkedin", "tiktok"].includes(l.platform.toLowerCase())),
                            ...filtered,
                          ]);
                        }}
                        className="flex-1"
                      />
                      <button
                        onClick={() => {
                          const all = getSocialLinks(draft);
                          const filtered = all.filter(
                            (l) => !["facebook", "instagram", "youtube", "x", "linkedin", "tiktok"].includes(l.platform.toLowerCase())
                          );
                          filtered.splice(i, 1);
                          updateDraft("footer.social_links", [
                            ...all.filter((l) => ["facebook", "instagram", "youtube", "x", "linkedin", "tiktok"].includes(l.platform.toLowerCase())),
                            ...filtered,
                          ]);
                        }}
                        className="text-red-400 hover:text-red-300 text-sm px-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </SectionCard>
        )}

        {activeSection === "SEO" && (
          <SectionCard
            title="SEO & Open Graph"
            keys={["seo.title", "seo.description", "seo.keywords", "seo.og_image_url", "seo.twitter_handle", "seo.canonical_url"]}
          >
            <Field label="SEO Title" dirty={isDirty("seo.title")}>
              <Input
                value={(draft["seo.title"] as string) || ""}
                onChange={(e) => updateDraft("seo.title", e.target.value)}
                placeholder="Fallbacks to Site Title if empty"
              />
            </Field>
            <Field label="SEO Description" dirty={isDirty("seo.description")}>
              <Textarea
                rows={3}
                value={(draft["seo.description"] as string) || ""}
                onChange={(e) => updateDraft("seo.description", e.target.value)}
                placeholder="Fallbacks to About Body if empty"
              />
            </Field>
            <Field label="Keywords" dirty={isDirty("seo.keywords")}>
              <Input
                value={(draft["seo.keywords"] as string) || ""}
                onChange={(e) => updateDraft("seo.keywords", e.target.value)}
                placeholder="mindfulness, transformation, faith, comma-separated"
              />
            </Field>
            <div>
              <label className="text-gold-pale font-medium text-sm mb-1.5 block">OG Image</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openPicker("seo.og_image_url")}
                  className="bg-gold-primary/15 text-gold-light hover:text-gold-pale px-3 py-2 rounded-md text-xs font-medium transition border border-gold-light/10"
                >
                  Pick from Media
                </button>
                <MediaThumb url={draft["seo.og_image_url"] as string} />
                {(draft["seo.og_image_url"] as string) && (
                  <span className="text-xs text-gold-light truncate max-w-xs">
                    {(draft["seo.og_image_url"] as string)?.slice(0, 60)}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Twitter / X Handle" dirty={isDirty("seo.twitter_handle")}>
                <Input
                  value={(draft["seo.twitter_handle"] as string) || ""}
                  onChange={(e) => updateDraft("seo.twitter_handle", e.target.value)}
                  placeholder="handle (without @)"
                />
              </Field>
              <Field label="Canonical URL" dirty={isDirty("seo.canonical_url")}>
                <Input
                  value={(draft["seo.canonical_url"] as string) || ""}
                  onChange={(e) => updateDraft("seo.canonical_url", e.target.value)}
                  placeholder="https://example.com/"
                />
              </Field>
            </div>
          </SectionCard>
        )}

        {activeSection === "Membership" && (
          <SectionCard
            title="Membership Pricing"
            keys={[
              "membership.product_name",
              "membership.product_description",
              "membership.regular_price",
              "membership.early_bird_price",
              "membership.early_bird_until",
              "membership.currency",
              "membership.stripe_product_id",
            ]}
          >
            <Field label="Product Name" dirty={isDirty("membership.product_name")}>
              <Input
                value={(draft["membership.product_name"] as string) || ""}
                onChange={(e) => updateDraft("membership.product_name", e.target.value)}
                placeholder="30-Day Membership Pass"
              />
              <p className="text-xs text-gold-light/70 mt-1">Shown on the Stripe checkout page.</p>
            </Field>
            <Field label="Product Description" dirty={isDirty("membership.product_description")}>
              <Textarea
                rows={2}
                value={(draft["membership.product_description"] as string) || ""}
                onChange={(e) => updateDraft("membership.product_description", e.target.value)}
                placeholder="Thirty days of members-only access to book chapters and event recordings."
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Regular Price" dirty={isDirty("membership.regular_price")}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={(draft["membership.regular_price"] as string) || "49"}
                  onChange={(e) => updateDraft("membership.regular_price", e.target.value)}
                  placeholder="49"
                />
              </Field>
              <Field label="Early-bird Price" dirty={isDirty("membership.early_bird_price")}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={(draft["membership.early_bird_price"] as string) || "29"}
                  onChange={(e) => updateDraft("membership.early_bird_price", e.target.value)}
                  placeholder="29"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Early-bird Until" dirty={isDirty("membership.early_bird_until")}>
                <Input
                  type="datetime-local"
                  value={(draft["membership.early_bird_until"] as string) || ""}
                  onChange={(e) => updateDraft("membership.early_bird_until", e.target.value)}
                />
                <p className="text-xs text-gold-light/70 mt-1">Leave blank to disable early-bird pricing.</p>
              </Field>
              <Field label="Currency" dirty={isDirty("membership.currency")}>
                <select
                  value={(draft["membership.currency"] as string) || "USD"}
                  onChange={(e) => updateDraft("membership.currency", e.target.value)}
                  className="w-full bg-brown-dark/40 border border-gold-light/20 rounded-lg px-3 py-2.5 text-gold-pale focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="MYR">MYR</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="SGD">SGD</option>
                  <option value="AUD">AUD</option>
                  <option value="CAD">CAD</option>
                </select>
              </Field>
            </div>
            <Field label="Stripe Product ID" dirty={isDirty("membership.stripe_product_id")}>
              <Input
                value={(draft["membership.stripe_product_id"] as string) || ""}
                onChange={(e) => updateDraft("membership.stripe_product_id", e.target.value)}
                placeholder="prod_..."
                disabled
              />
              <p className="text-xs text-gold-light/70 mt-1">Auto-generated when the first checkout is created. Read-only.</p>
            </Field>
          </SectionCard>
        )}
      </div>

      {pickerOpen && (
        <MediaPickerModal
          onSelect={handleSelectMedia}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
    </SettingsSectionContext.Provider>
  );
}
