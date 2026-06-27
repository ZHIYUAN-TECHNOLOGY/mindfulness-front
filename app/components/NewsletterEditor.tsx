import { useState } from "react";
import type { EmailBlock } from "../shared";
import { MediaPickerModal } from "./MediaPickerModal";

interface Props {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
}

export function NewsletterEditor({ blocks, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTargetIndex, setPickerTargetIndex] = useState<number | null>(null);

  const addBlock = (type: EmailBlock["type"]) => {
    const newBlock: EmailBlock =
      type === "text"
        ? { type: "text", content: "" }
        : type === "image"
        ? { type: "image", mediaId: "", alt: "" }
        : { type: "button", text: "", url: "", align: "center" };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updates: Partial<EmailBlock>) => {
    const next = blocks.map((b, i) => (i === index ? { ...b, ...updates } : b));
    onChange(next);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(index, 1);
    next.splice(newIndex, 0, item);
    onChange(next);
  };

  const openPicker = (index: number) => {
    setPickerTargetIndex(index);
    setPickerOpen(true);
  };

  const handleSelectMedia = (_id: string, url: string) => {
    if (pickerTargetIndex !== null) {
      updateBlock(pickerTargetIndex, { mediaId: url });
    }
    setPickerOpen(false);
    setPickerTargetIndex(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, i) => (
        <div key={i} className="bg-brown-dark border border-gold-light/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gold-light">
              {block.type}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(i, -1)}
                disabled={i === 0}
                className="p-1 rounded hover:bg-gold-primary/20 text-gold-light disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(i, 1)}
                disabled={i === blocks.length - 1}
                className="p-1 rounded hover:bg-gold-primary/20 text-gold-light disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeBlock(i)}
                className="p-1 rounded hover:bg-red-900/30 text-red-300 ml-1"
              >
                ✕
              </button>
            </div>
          </div>

          {block.type === "text" && (
            <textarea
              value={block.content || ""}
              onChange={(e) => updateBlock(i, { content: e.target.value })}
              placeholder="Enter text content... HTML is supported"
              className="w-full h-32 px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary text-sm"
            />
          )}

          {block.type === "image" && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => openPicker(i)}
                className="px-3 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition text-left"
              >
                {block.mediaId ? "Change Image" : "Select Image"}
              </button>
              {block.mediaId && (
                <img
                  src={block.mediaId}
                  alt={block.alt || ""}
                  className="max-h-40 object-contain rounded"
                />
              )}
              <input
                type="text"
                value={block.alt || ""}
                onChange={(e) => updateBlock(i, { alt: e.target.value })}
                placeholder="Alt text (optional)"
                className="px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary text-sm"
              />
            </div>
          )}

          {block.type === "button" && (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={block.text || ""}
                onChange={(e) => updateBlock(i, { text: e.target.value })}
                placeholder="Button text"
                className="px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary text-sm"
              />
              <input
                type="text"
                value={block.url || ""}
                onChange={(e) => updateBlock(i, { url: e.target.value })}
                placeholder="https://..."
                className="px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary text-sm"
              />
              <select
                value={block.align || "center"}
                onChange={(e) => updateBlock(i, { align: e.target.value as any })}
                className="px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale text-sm focus:outline-none focus:border-gold-primary"
              >
                <option value="left">Align Left</option>
                <option value="center">Align Center</option>
                <option value="right">Align Right</option>
              </select>
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addBlock("text")}
          className="px-3 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
        >
          + Text
        </button>
        <button
          type="button"
          onClick={() => addBlock("image")}
          className="px-3 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
        >
          + Image
        </button>
        <button
          type="button"
          onClick={() => addBlock("button")}
          className="px-3 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
        >
          + Button
        </button>
      </div>

      {pickerOpen && (
        <MediaPickerModal
          onSelect={handleSelectMedia}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
