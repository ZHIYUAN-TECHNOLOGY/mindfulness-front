import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { MediaPickerModal } from "./MediaPickerModal";
import { getYouTubeThumbnailUrl, getYouTubeVideoId } from "../lib/youtube";

export interface AdminEventVideo {
  id: string;
  title: string;
  provider: "youtube" | "r2";
  videoUrl: string;
  thumbnailUrl: string | null;
  sortOrder: number;
}

interface Props {
  eventId: string;
}

export function EventVideoEditor({ eventId }: Props) {
  const [videos, setVideos] = useState<AdminEventVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [pickerField, setPickerField] = useState<"videoUrl" | "thumbnailUrl" | null>(null);

  useEffect(() => {
    apiFetch(`/api/events/${eventId}/videos`)
      .then((data) => setVideos(data.videos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  const addVideo = () => {
    setVideos([
      ...videos,
      {
        id: `new-${Date.now()}`,
        title: "",
        provider: "youtube",
        videoUrl: "",
        thumbnailUrl: "",
        sortOrder: videos.length,
      },
    ]);
  };


  const updateVideo = (index: number, patch: Partial<AdminEventVideo>) => {
    const current = videos[index];
    if (!current) return;

    let merged: AdminEventVideo = { ...current, ...patch };

    // Auto-fetch YouTube thumbnail when a valid YouTube URL is entered and no custom thumbnail exists.
    if (
      merged.provider === "youtube" &&
      merged.videoUrl &&
      getYouTubeVideoId(merged.videoUrl) &&
      (!current.thumbnailUrl || current.thumbnailUrl === getYouTubeThumbnailUrl(current.videoUrl || "", "hq"))
    ) {
      const autoThumb = getYouTubeThumbnailUrl(merged.videoUrl, "hq");
      if (autoThumb && autoThumb !== current.thumbnailUrl) {
        merged = { ...merged, thumbnailUrl: autoThumb };
      }
    }

    const next = videos.map((v, i) => (i === index ? merged : v));
    setVideos(next);
  };

  const removeVideo = async (index: number) => {
    const video = videos[index];
    if (video.id) {
      if (!confirm(`Delete "${video.title || "this video"}"?`)) return;
      await apiFetch(`/api/events/videos/${video.id}`, { method: "DELETE" });
    }
    setVideos(videos.filter((_, i) => i !== index));
  };

  const saveVideos = async () => {
    setSaving(true);
    try {
      const next = [...videos];
      for (let i = 0; i < next.length; i++) {
        const v = next[i];
        if (!v || !v.title?.trim() || !v.videoUrl?.trim()) continue;

        const payload = {
          title: v.title.trim(),
          provider: v.provider,
          videoUrl: v.videoUrl.trim(),
          thumbnailUrl: v.thumbnailUrl?.trim() || undefined,
          sortOrder: v.sortOrder ?? i,
        };

        if (v.id) {
          const res = await apiFetch(`/api/events/videos/${v.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
          next[i] = res.video;
        } else {
          const res = await apiFetch(`/api/events/${eventId}/videos`, {
            method: "POST",
            body: JSON.stringify({ ...payload, eventId }),
          });
          next[i] = res.video;
        }
      }
      setVideos(next);
      alert("Videos saved.");
    } catch (err: any) {
      alert(err.message || "Failed to save videos");
    } finally {
      setSaving(false);
    }
  };

  const handlePick = (_id: string, url: string) => {
    if (pickerIndex == null || !pickerField) return;
    updateVideo(pickerIndex, { [pickerField]: url });
    setPickerIndex(null);
    setPickerField(null);
  };

  if (loading) return <p className="text-sm text-gold-light">Loading videos…</p>;

  return (
    <div className="space-y-4">
      {videos.map((video, i) => (
        <div key={video.id || i} className="border border-gold-light/10 rounded-lg p-4 bg-brown-dark/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              value={video.title}
              onChange={(e) => updateVideo(i, { title: e.target.value })}
              placeholder="Video title"
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
            />
            <select
              value={video.provider}
              onChange={(e) => updateVideo(i, { provider: e.target.value as any })}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale focus:outline-none focus:border-gold-primary"
            >
              <option value="youtube">YouTube</option>
              <option value="r2">R2 / Self-hosted</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={video.videoUrl || ""}
                onChange={(e) => updateVideo(i, { videoUrl: e.target.value })}
                placeholder="Video URL"
                className="flex-1 px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
              />
              <button
                type="button"
                onClick={() => { setPickerIndex(i); setPickerField("videoUrl"); }}
                className="px-3 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10"
              >
                Pick
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={video.thumbnailUrl || ""}
                onChange={(e) => updateVideo(i, { thumbnailUrl: e.target.value })}
                placeholder="Thumbnail URL (optional)"
                className="flex-1 px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
              />
              <button
                type="button"
                onClick={() => { setPickerIndex(i); setPickerField("thumbnailUrl"); }}
                className="px-3 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10"
              >
                Pick
              </button>
            </div>
            {video.provider === "youtube" && video.videoUrl && getYouTubeVideoId(video.videoUrl) && (
              <div className="flex items-center gap-3 mt-2">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="h-16 w-auto rounded border border-gold-light/20 object-cover"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    const thumb = getYouTubeThumbnailUrl(video.videoUrl, "hq");
                    if (thumb) updateVideo(i, { thumbnailUrl: thumb });
                  }}
                  className="text-xs text-gold-light hover:text-gold-pale underline"
                >
                  Fetch YouTube thumbnail
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <input
              type="number"
              min={0}
              value={video.sortOrder}
              onChange={(e) => updateVideo(i, { sortOrder: parseInt(e.target.value, 10) || 0 })}
              placeholder="Sort order"
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
            />
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => removeVideo(i)}
                className="text-red-300 hover:text-red-200 text-xs underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={addVideo}
          className="px-4 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10"
        >
          + Add Video
        </button>
        <button
          type="button"
          onClick={saveVideos}
          disabled={saving}
          className="px-4 py-2 rounded bg-gold-primary text-brown-dark text-sm font-semibold hover:bg-gold-light transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Videos"}
        </button>
      </div>

      {pickerIndex != null && (
        <MediaPickerModal
          onSelect={handlePick}
          onClose={() => { setPickerIndex(null); setPickerField(null); }}
        />
      )}
    </div>
  );
}
