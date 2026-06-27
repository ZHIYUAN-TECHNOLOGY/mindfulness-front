import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import type { TemplateKey, TemplateMetadata } from "../shared";

interface Props {
  value: TemplateKey;
  onChange: (key: TemplateKey) => void;
}

export function NewsletterTemplateGallery({ value, onChange }: Props) {
  const [templates, setTemplates] = useState<TemplateMetadata[]>([]);
  const [previewKey, setPreviewKey] = useState<TemplateKey | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    apiFetch("/api/newsletter/templates")
      .then((data) => setTemplates(data.templates || []))
      .catch(() => {});
  }, []);

  const openPreview = async (key: TemplateKey) => {
    setPreviewKey(key);
    setPreviewLoading(true);
    setPreviewHtml("");
    try {
      const data = await apiFetch(
        `/api/newsletter/templates/sample?key=${encodeURIComponent(key)}`
      );
      setPreviewHtml(data.html || "");
    } catch {
      setPreviewHtml("<p style='padding:24px;font-family:sans-serif;color:#900'>Preview failed.</p>");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((t) => {
          const selected = value === t.key;
          return (
            <div
              key={t.key}
              className={`relative rounded-lg border p-4 transition cursor-pointer ${
                selected
                  ? "border-gold-primary bg-gold-primary/10 shadow-[0_0_0_1px_rgba(184,146,61,0.4)_inset]"
                  : "border-gold-light/20 bg-brown-dark hover:border-gold-light/40"
              }`}
              onClick={() => onChange(t.key)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-semibold text-gold-pale">{t.name}</h4>
                {selected && (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gold-primary px-1.5 py-0.5 rounded bg-gold-primary/20">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-gold-light/80 leading-relaxed mb-3">
                {t.description}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openPreview(t.key);
                }}
                className="text-xs text-gold-primary hover:text-gold-light underline"
              >
                Preview sample →
              </button>
            </div>
          );
        })}
      </div>

      {previewKey && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewKey(null)}
        >
          <div
            className="bg-brown-dark rounded-lg w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden border border-gold-light/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gold-light/20">
              <h3 className="text-sm font-semibold text-gold-pale">
                Sample: {templates.find((t) => t.key === previewKey)?.name}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewKey(null)}
                className="text-gold-light hover:text-gold-pale text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 bg-white">
              {previewLoading ? (
                <p className="text-sm text-gold-light p-6">Loading...</p>
              ) : (
                <iframe
                  title="Template preview"
                  srcDoc={previewHtml}
                  className="w-full h-full"
                  sandbox="allow-same-origin"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
