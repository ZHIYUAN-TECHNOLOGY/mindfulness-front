import { useState } from "react";
import { MediaPickerModal } from "./MediaPickerModal";

export type EventBlock =
  | { type: "text"; content: string }
  | { type: "heading"; content: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "quote"; content: string; attribution?: string }
  | { type: "button"; text: string; url: string };

interface Props {
  value: EventBlock[];
  onChange: (blocks: EventBlock[]) => void;
}

export function EventBlocksEditor({ value, onChange }: Props) {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const updateBlock = (index: number, patch: Partial<EventBlock>) => {
    const next = value.map((b, i) => {
      if (i !== index) return b;
      const merged = { ...b, ...patch };
      if (merged.type === "text" || merged.type === "heading") {
        return { type: merged.type, content: merged.content || "" } as EventBlock;
      }
      if (merged.type === "image") {
        return { type: "image", url: merged.url || "", caption: merged.caption } as EventBlock;
      }
      if (merged.type === "quote") {
        return { type: "quote", content: merged.content || "", attribution: merged.attribution } as EventBlock;
      }
      if (merged.type === "button") {
        return { type: "button", text: (merged as any).text || "", url: (merged as any).url || "" } as EventBlock;
      }
      return b;
    });
    onChange(next);
  };

  const addBlock = (type: EventBlock["type"]) => {
    const base: EventBlock =
      type === "text"
        ? { type, content: "" }
        : type === "heading"
        ? { type, content: "" }
        : type === "image"
        ? { type, url: "", caption: "" }
        : type === "quote"
        ? { type, content: "", attribution: "" }
        : { type, text: "", url: "" };
    onChange([...value, base]);
  };

  const removeBlock = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const moveBlock = (from: number, to: number) => {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const handleSelectMedia = (_id: string, url: string) => {
    if (pickerIndex == null) return;
    updateBlock(pickerIndex, { url });
    setPickerIndex(null);
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-gold-light/60 italic">
          No content blocks yet. Add text, headings, images, quotes, or buttons below.
        </p>
      )}

      {value.map((block, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex == null || dragIndex === i) return;
            moveBlock(dragIndex, i);
            setDragIndex(null);
          }}
          onDragEnd={() => setDragIndex(null)}
          className={`border border-gold-light/10 rounded-lg bg-brown-dark/40 p-4 transition ${
            dragIndex === i ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-gold-light uppercase tracking-wider font-semibold">
              <svg className="w-4 h-4 cursor-grab" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
              {block.type}
            </div>
            <button
              type="button"
              onClick={() => removeBlock(i)}
              className="text-red-300 hover:text-red-200 text-xs underline"
            >
              Remove
            </button>
          </div>

          {block.type === "text" && (
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(i, { content: e.target.value })}
              rows={5}
              placeholder="Write paragraph text..."
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary resize-y"
            />
          )}

          {block.type === "heading" && (
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(i, { content: e.target.value })}
              placeholder="Section heading"
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
            />
          )}

          {block.type === "image" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPickerIndex(i)}
                  className="px-4 py-2 rounded border border-gold-light/20 text-gold-light text-sm hover:bg-gold-primary/10 transition"
                >
                  {block.url ? "Change Image" : "Select Image"}
                </button>
                {block.url && (
                  <img
                    src={block.url}
                    alt=""
                    className="h-16 w-auto rounded border border-gold-light/20 object-cover"
                  />
                )}
              </div>
              <input
                type="text"
                value={block.caption || ""}
                onChange={(e) => updateBlock(i, { caption: e.target.value })}
                placeholder="Caption (optional)"
                className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
              />
            </div>
          )}

          {block.type === "quote" && (
            <div className="space-y-3">
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(i, { content: e.target.value })}
                rows={3}
                placeholder="Quote text"
                className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary resize-y"
              />
              <input
                type="text"
                value={block.attribution || ""}
                onChange={(e) => updateBlock(i, { attribution: e.target.value })}
                placeholder="Attribution (optional)"
                className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
              />
            </div>
          )}

          {block.type === "button" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={block.text}
                onChange={(e) => updateBlock(i, { text: e.target.value })}
                placeholder="Button text"
                className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
              />
              <input
                type="text"
                value={block.url}
                onChange={(e) => updateBlock(i, { url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2 pt-2">
        {(["text", "heading", "image", "quote", "button"] as EventBlock["type"][]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => addBlock(t)}
            className="px-3 py-1.5 rounded border border-gold-light/20 text-gold-light text-xs font-medium hover:bg-gold-primary/10 transition"
          >
            + {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {pickerIndex != null && (
        <MediaPickerModal
          onSelect={handleSelectMedia}
          onClose={() => setPickerIndex(null)}
        />
      )}
    </div>
  );
}
