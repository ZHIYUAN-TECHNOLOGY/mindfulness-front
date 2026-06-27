import type { Block } from "./BlockEditor";
export type { Block };
import { normalizeMediaUrl, resolveMediaUrl } from "../lib/media";

function getYouTubeEmbedUrl(url: string): string {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  try {
    const u = new URL(url);
    if (u.pathname.startsWith("/embed/")) return url;
  } catch {}
  return "";
}

interface Props {
  blocks: Block[];
  className?: string;
}

export function BlockRenderer({ blocks, className }: Props) {
  return (
    <div className={`space-y-8 ${className || ""}`}>
      {blocks.map((block, i) => (
        <div key={i} className={`block-${block.type}`}>
          {block.type === "paragraph" && (
            <p className="block-paragraph">{block.content}</p>
          )}

          {block.type === "heading" &&
            (block.level === 2 ? (
              <h2 className="block-heading block-heading--2">
                {block.content}
              </h2>
            ) : (
              <h3 className="block-heading block-heading--3">
                {block.content}
              </h3>
            ))}

          {block.type === "image" && (
            <figure className="space-y-2">
              <img
                src={resolveMediaUrl(`${API_BASE_URL}/api/upload/media/${block.mediaId}/content`)}
                alt={block.caption || ""}
                className="w-full rounded-lg object-cover max-h-[60vh]"
              />
              <figcaption className="text-sm text-gold-light/60 text-center">
                {block.caption}
              </figcaption>
            </figure>
          )}

          {block.type === "video" && (
            <figure className="space-y-2">
              {block.provider === "youtube" ? (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={getYouTubeEmbedUrl(block.videoUrl)}
                    title={block.caption || "Embedded video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <video
                  controls
                  src={resolveMediaUrl(block.videoUrl)}
                  className="w-full rounded-lg max-h-[60vh] bg-black"
                />
              )}
              {block.caption && (
                <figcaption className="text-sm text-gold-light/60 text-center">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          )}

          {block.type === "quote" && (
            <blockquote className="border-l-4 border-gold-primary pl-4 py-2 bg-gold-primary/10 rounded-r-lg">
              <p className="text-lg italic text-gold-pale">{block.content}</p>
              <cite className="text-sm text-gold-light/60 block mt-2 not-italic">
                — {block.attribution}
              </cite>
            </blockquote>
          )}

          {block.type === "divider" && (
            <hr className="border-gold-light/10 my-8" />
          )}
        </div>
      ))}
    </div>
  );
}
