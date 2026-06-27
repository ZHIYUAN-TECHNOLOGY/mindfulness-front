import { useState } from "react";
import { MediaPickerModal } from "./MediaPickerModal";
import { API_BASE_URL } from "../lib/api";

export type Block =
  | { type: "paragraph"; content: string }
  | { type: "heading"; level: 2 | 3; content: string }
  | { type: "image"; mediaId: string; caption?: string }
  | { type: "video"; videoUrl: string; provider?: "youtube" | "r2"; caption?: string }
  | { type: "quote"; content: string; attribution?: string }
  | { type: "divider" };

interface Props {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export function BlockEditor({ blocks, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const updateBlock = (index: number, updated: Block) => {
    const next = [...blocks];
    next[index] = updated;
    onChange(next);
  };

  const removeBlock = (index: number) => {
    const next = [...blocks];
    next.splice(index, 1);
    onChange(next);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const next = [...blocks];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onChange(next);
  };

  const addBlock = (type: Block["type"]) => {
    let newBlock: Block;
    switch (type) {
      case "paragraph":
        newBlock = { type: "paragraph", content: "" };
        break;
      case "heading":
        newBlock = { type: "heading", level: 2, content: "" };
        break;
      case "image":
        newBlock = { type: "image", mediaId: "" };
        break;
      case "video":
        newBlock = { type: "video", videoUrl: "", provider: "youtube" };
        break;
      case "quote":
        newBlock = { type: "quote", content: "" };
        break;
      case "divider":
        newBlock = { type: "divider" };
        break;
    }
    onChange([...blocks, newBlock]);
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <div
          key={i}
          className="bg-brown-dark/60 border border-gold-light/15 rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gold-light/50 uppercase">
              {block.type}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveBlock(i, -1)}
                disabled={i === 0}
                className="text-gold-light/40 hover:text-gold-pale disabled:opacity-30 text-xs px-2"
                title="Move Up"
              >
                ▲
              </button>
              <button
                onClick={() => moveBlock(i, 1)}
                disabled={i === blocks.length - 1}
                className="text-gold-light/40 hover:text-gold-pale disabled:opacity-30 text-xs px-2"
                title="Move Down"
              >
                ▼
              </button>
              <button
                onClick={() => removeBlock(i)}
                className="text-red-400 hover:text-red-300 text-xs px-2"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>

          {block.type === "paragraph" && (
            <textarea
              rows={4}
              className="w-full border border-gold-light/20 rounded-lg px-3 py-2 text-sm bg-brown-dark/40 text-gold-pale placeholder:text-gold-light/30 focus:outline-none focus:border-gold-primary"
              placeholder="Write paragraph..."
              value={block.content}
              onChange={(e) =>
                updateBlock(i, { ...block, content: e.target.value })
              }
            />
          )}

          {block.type === "heading" && (
            <div className="flex gap-2">
              <select
                className="border border-gold-light/20 rounded-lg px-2 py-2 text-sm bg-brown-dark/40 text-gold-pale focus:outline-none focus:border-gold-primary"
                value={block.level}
                onChange={(e) =>
                  updateBlock(i, {
                    ...block,
                    level: Number(e.target.value) as 2 | 3,
                  })
                }
              >
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
              <input
                type="text"
                className="flex-1 w-full border border-gold-light/20 rounded-lg px-3 py-2 text-sm bg-brown-dark/40 text-gold-pale placeholder:text-gold-light/30 focus:outline-none focus:border-gold-primary"
                placeholder="Heading text"
                value={block.content}
                onChange={(e) =>
                  updateBlock(i, { ...block, content: e.target.value })
                }
              />
            </div>
          )}

          {block.type === "image" && (
            <div className="space-y-2">
              {!block.mediaId ? (
                <button
                  onClick={() => {
                    setPickerIndex(i);
                    setPickerOpen(true);
                  }}
                  className="bg-gold-primary/10 text-gold-pale border border-gold-light/20 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gold-primary/20 transition"
                >
                  Pick Image
                </button>
              ) : (
                <div className="space-y-2">
                  <img
                    src={`${API_BASE_URL}/api/upload/media/${block.mediaId}/content`}
                    alt="Selected"
                    className="h-24 w-auto rounded object-cover"
                  />
                  <button
                    onClick={() => {
                      setPickerIndex(i);
                      setPickerOpen(true);
                    }}
                    className="bg-gold-primary/10 text-gold-pale border border-gold-light/20 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gold-primary/20 transition"
                  >
                    Change Image
                  </button>
                </div>
              )}
              <input
                type="text"
                className="w-full border border-gold-light/20 rounded-lg px-3 py-2 text-sm bg-brown-dark/40 text-gold-pale placeholder:text-gold-light/30 focus:outline-none focus:border-gold-primary"
                placeholder="Caption (optional)"
                value={block.caption ?? ""}
                onChange={(e) =>
                  updateBlock(i, { ...block, caption: e.target.value })
                }
              />
            </div>
          )}

          {block.type === "quote" && (
            <div className="space-y-2">
              <textarea
                rows={3}
                className="w-full border border-gold-light/20 rounded-lg px-3 py-2 text-sm italic bg-brown-dark/40 text-gold-pale placeholder:text-gold-light/30 focus:outline-none focus:border-gold-primary"
                placeholder="Quote text..."
                value={block.content}
                onChange={(e) =>
                  updateBlock(i, { ...block, content: e.target.value })
                }
              />
              <input
                type="text"
                className="w-full border border-gold-light/20 rounded-lg px-3 py-2 text-sm bg-brown-dark/40 text-gold-pale placeholder:text-gold-light/30 focus:outline-none focus:border-gold-primary"
                placeholder="Attribution (optional)"
                value={block.attribution ?? ""}
                onChange={(e) =>
                  updateBlock(i, { ...block, attribution: e.target.value })
                }
              />
            </div>
          )}

          {block.type === "video" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  className="border border-gold-light/20 rounded-lg px-2 py-2 text-sm bg-brown-dark/40 text-gold-pale focus:outline-none focus:border-gold-primary"
                  value={block.provider || "youtube"}
                  onChange={(e) =>
                    updateBlock(i, {
                      ...block,
                      provider: e.target.value as "youtube" | "r2",
                    })
                  }
                >
                  <option value="youtube">YouTube</option>
                  <option value="r2">R2 / Direct</option>
                </select>
                <input
                  type="text"
                  className="flex-1 border border-gold-light/20 rounded-lg px-3 py-2 text-sm bg-brown-dark/40 text-gold-pale placeholder:text-gold-light/30 focus:outline-none focus:border-gold-primary"
                  placeholder="https://youtube.com/watch?v=... or video URL"
                  value={block.videoUrl}
                  onChange={(e) =>
                    updateBlock(i, { ...block, videoUrl: e.target.value })
                  }
                />
              </div>
              <input
                type="text"
                className="w-full border border-gold-light/20 rounded-lg px-3 py-2 text-sm bg-brown-dark/40 text-gold-pale placeholder:text-gold-light/30 focus:outline-none focus:border-gold-primary"
                placeholder="Caption (optional)"
                value={block.caption ?? ""}
                onChange={(e) =>
                  updateBlock(i, { ...block, caption: e.target.value })
                }
              />
            </div>
          )}

          {block.type === "divider" && <hr className="border-gold-light/20" />}
        </div>
      ))}

      <div className="flex flex-wrap gap-2 pt-2">
        {(["paragraph", "heading", "image", "video", "quote", "divider"] as const).map(
          (t) => (
            <button
              key={t}
              onClick={() => addBlock(t)}
              className="bg-gold-primary/10 text-gold-pale border border-gold-light/20 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gold-primary/20 transition"
            >
              + {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          )
        )}
      </div>

      {pickerOpen && pickerIndex !== null && (
        <MediaPickerModal
          onSelect={(id) => {
            const block = blocks[pickerIndex];
            if (block && block.type === "image") {
              updateBlock(pickerIndex, { ...block, mediaId: id });
            }
            setPickerOpen(false);
            setPickerIndex(null);
          }}
          onClose={() => {
            setPickerOpen(false);
            setPickerIndex(null);
          }}
        />
      )}
    </div>
  );
}
