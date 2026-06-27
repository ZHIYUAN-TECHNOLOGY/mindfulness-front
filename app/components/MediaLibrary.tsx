import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/api";
import { resolveMediaUrl } from "../lib/media";

interface MediaAsset {
  id: string;
  filename: string;
  r2Url: string;
  previewUrl?: string;
  mimetype: string;
  sizeBytes: number;
  tags: string[];
  createdAt: string;
}

const TAGS = ["", "logo", "hero", "book", "podcast"];
const TAG_LABELS: Record<string, string> = {
  "": "All",
  logo: "Logo",
  hero: "Hero",
  book: "Book",
  podcast: "Podcast",
};

export function MediaLibrary() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [tag, setTag] = useState("");
  const [uploadTag, setUploadTag] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const qs = tag ? `?tag=${tag}&_t=${Date.now()}` : `?_t=${Date.now()}`;
    apiFetch(`/api/upload/media${qs}`)
      .then((data) => setMedia(data.media))
      .catch((e) => setError(e.message || "Failed to load media"));
  }, [tag]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (uploadTag) form.append("tag", uploadTag);
      await apiFetch("/api/upload", { method: "POST", body: form, headers: {} });
      load();
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset?")) return;
    await apiFetch(`/api/upload/media/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gold-pale">Media Library</h1>

      {error && (
        <div className="mb-4 bg-red-900/30 text-red-300 p-3 rounded border border-red-500/30">
          {error}
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]);
        }}
        className={`border-2 border-dashed p-8 text-center mb-6 rounded transition-colors ${
          dragOver
            ? "border-gold-primary bg-gold-primary/10"
            : "border-gold-light/30 bg-brown-dark/30"
        }`}
      >
        <p className="text-gold-light mb-2">
          {uploading ? "Uploading..." : "Drag & drop files here, or click to upload"}
        </p>
        <div className="mb-3 flex items-center justify-center gap-2 text-sm">
          <span className="text-gold-light/80">Upload category:</span>
          <select
            value={uploadTag}
            onChange={(e) => setUploadTag(e.target.value)}
            className="bg-brown-dark border border-gold-light/30 rounded px-2 py-1 text-gold-light"
            disabled={uploading}
          >
            {TAGS.map((t) => (
              <option key={`upload-${t || "all"}`} value={t}>
                {TAG_LABELS[t] || t}
              </option>
            ))}
          </select>
        </div>
        <input
          type="file"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          className="hidden"
          id="file-input"
          disabled={uploading}
        />
        <label
          htmlFor="file-input"
          className="cursor-pointer text-gold-primary hover:text-gold-light underline transition"
        >
          Browse
        </label>
      </div>

      <div className="flex gap-2 mb-4">
        {TAGS.map((t) => (
          <button
            key={t || "all"}
            onClick={() => setTag(t)}
            className={`px-3 py-1 rounded text-sm transition ${
              tag === t
                ? "bg-gold-primary text-brown-dark"
                : "bg-gold-primary/10 text-gold-light hover:bg-gold-primary/20"
            }`}
          >
            {TAG_LABELS[t] || t}
          </button>
        ))}
      </div>

      {media.length === 0 ? (
        <p className="text-gold-light/50 text-center py-12">No media uploaded yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((m) => (
            <div
              key={m.id}
              className="border border-gold-light/20 rounded p-2 relative group bg-brown-dark/30 hover:border-gold-primary/50 transition"
            >
              {m.mimetype.startsWith("image/") ? (
                <>
                  <img
                    src={resolveMediaUrl(m.r2Url)}
                    alt={m.filename}
                    className="w-full h-24 object-cover rounded"
                    loading="lazy"
                    onError={(e) => {
                      console.error("MediaLibrary image failed:", (e.target as HTMLImageElement).src);
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                      const fallback = img.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.classList.remove("hidden");
                    }}
                  />
                  <div className="hidden flex w-full h-24 bg-gold-primary/20 rounded text-gold-pale text-xs items-center justify-center">
                    Preview unavailable
                  </div>
                </>
              ) : m.mimetype.startsWith("video/") ? (
                <div className="w-full h-24 bg-gold-primary/20 flex items-center justify-center rounded text-gold-pale">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="ml-2 text-xs">VIDEO</span>
                </div>
              ) : (
                <div className="w-full h-24 bg-gold-primary/20 flex items-center justify-center rounded text-gold-pale text-xs">
                  {m.mimetype.split("/")[1]?.toUpperCase() || "FILE"}
                </div>
              )}
              <p className="text-xs mt-1 truncate text-gold-light">{m.filename}</p>
              <p className="text-[10px] text-gold-light/50">
                {(m.sizeBytes / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={() => handleDelete(m.id)}
                className="absolute top-1 right-1 bg-red-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
