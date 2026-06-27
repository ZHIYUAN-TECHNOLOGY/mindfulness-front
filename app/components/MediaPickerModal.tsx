import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { resolveMediaUrl } from "../lib/media";

interface MediaAsset {
  id: string;
  filename: string;
  r2Url: string;
  previewUrl?: string;
  servingUrl?: string;
  mimetype: string;
  sizeBytes: number;
  tags: string[];
  createdAt: string;
}

export function MediaPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (id: string, url: string) => void;
  onClose: () => void;
}) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [tag, setTag] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");

  useEffect(() => {
    const qs = tag ? `?tag=${tag}` : "";
    apiFetch(`/api/upload/media${qs}`).then((data) => setMedia(data.media));
  }, [tag]);

  const filtered = media.filter((m) => {
    if (filterType === "image") return m.mimetype.startsWith("image/");
    if (filterType === "video") return m.mimetype.startsWith("video/");
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-brown-dark border border-gold-light/30 px-8 py-6 rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gold-pale">Select Media</h2>
          <button onClick={onClose} className="text-gold-light hover:text-white">✕</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {["", "logo", "hero", "book", "podcast", "video"].map((t) => (
            <button
              key={t || "all"}
              onClick={() => setTag(t)}
              className={`px-3 py-1 rounded text-sm ${tag === t ? "bg-gold-primary text-brown-dark" : "bg-gold-primary/10 text-gold-light"}`}
            >
              {t || "All"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          {(["all", "image", "video"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded text-xs ${filterType === t ? "bg-gold-light text-brown-dark" : "bg-brown-dark/50 text-gold-light border border-gold-light/20"}`}
            >
              {t === "all" ? "All Types" : t === "image" ? "Images" : "Videos"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                // Use the public R2 URL directly. The bucket is public, so no
                // need to proxy through the API. resolveMediaUrl handles old S3
                // endpoint URLs by rewriting them to the new public R2 URL.
                const url = resolveMediaUrl(m.r2Url);
                onSelect(m.id, url);
                onClose();
              }}
              className="cursor-pointer border border-gold-light/20 rounded p-2 hover:border-gold-primary"
            >
              {(() => {
                const previewSrc = resolveMediaUrl(m.r2Url);
                return m.mimetype.startsWith("image/") ? (
                  <img src={previewSrc} alt={m.filename} className="w-full h-24 object-cover rounded" onError={(e) => console.error("MediaPickerModal image failed:", (e.target as HTMLImageElement).src)} />
                ) : m.mimetype.startsWith("video/") ? (
                  <div className="w-full h-24 bg-gold-primary/20 flex items-center justify-center rounded text-gold-pale">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span className="ml-2 text-xs">VIDEO</span>
                  </div>
                ) : (
                  <div className="w-full h-24 bg-gold-primary/20 flex items-center justify-center rounded text-gold-pale">{m.mimetype.split("/")[1]?.toUpperCase() || "FILE"}</div>
                );
              })()}
              <p className="text-xs mt-1 truncate text-gold-light">{m.filename}</p>
              <p className="text-[10px] text-gold-light/50">{(m.sizeBytes / (1024 * 1024)).toFixed(1)} MB</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
