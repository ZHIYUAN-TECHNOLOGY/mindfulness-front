import { normalizeMediaUrl } from "../lib/media";

export type EventBlock =
  | { type: "text"; content: string }
  | { type: "heading"; content: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "quote"; content: string; attribution?: string }
  | { type: "button"; text: string; url: string };

interface Props {
  blocks: EventBlock[];
  fallbackLongDescription?: string | null;
}

export function EventBlocksRenderer({ blocks, fallbackLongDescription }: Props) {
  const items =
    blocks.length > 0
      ? blocks
      : fallbackLongDescription
      ? [{ type: "text" as const, content: fallbackLongDescription }]
      : [];

  return (
    <div className="space-y-8">
      {items.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h3 key={i} className="display display-s mt-2">
              {block.content}
            </h3>
          );
        }

        if (block.type === "text") {
          return (
            <div
              key={i}
              className="body-prose"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {block.content}
            </div>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={i} className="photo-warm">
              <img
                src={normalizeMediaUrl(block.url)}
                alt={block.caption || ""}
                className="w-full"
              />
              {block.caption && (
                <figcaption className="text-sm text-gold-light/70 mt-3 text-center">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={i} className="border-l-2 border-gold-primary pl-6 py-1">
              <p className="font-serif text-xl italic text-ink">{block.content}</p>
              {block.attribution && (
                <cite className="block mt-2 text-sm text-gold-light not-italic">
                  — {block.attribution}
                </cite>
              )}
            </blockquote>
          );
        }

        if (block.type === "button") {
          return (
            <div key={i}>
              <a
                href={block.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ed btn-primary inline-flex"
              >
                {block.text}
                <span className="btn-arrow">→</span>
              </a>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
