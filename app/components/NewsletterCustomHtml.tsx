import { useEffect, useMemo, useRef, useState } from "react";
import { STARTER_CUSTOM_HTML } from "../shared";

interface Props {
  value: string;
  onChange: (next: string) => void;
}

function previewWith(html: string): string {
  const sample =
    "<p style='font-family:Georgia,serif;font-size:17px;line-height:1.7;'>This is your block content. It replaces <code>{{CONTENT}}</code> when the newsletter is sent.</p>";
  return html
    .replace(/\{\{\s*CONTENT\s*\}\}/g, sample)
    .replace(/\{\{\s*UNSUBSCRIBE_URL\s*\}\}/g, "#unsubscribe");
}

export function NewsletterCustomHtml({ value, onChange }: Props) {
  const [showPreview, setShowPreview] = useState(true);
  const initialized = useRef(false);
  const previewHtml = useMemo(() => previewWith(value || STARTER_CUSTOM_HTML), [value]);

  useEffect(() => {
    if (!initialized.current && !value) {
      initialized.current = true;
      onChange(STARTER_CUSTOM_HTML);
    }
  }, [value, onChange]);

  const useStarter = () => onChange(STARTER_CUSTOM_HTML);

  return (
    <div className="rounded-lg border border-gold-light/20 bg-brown-dark p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gold-pale">Custom HTML letterhead</h4>
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={useStarter}
            className="text-gold-primary hover:text-gold-light underline"
          >
            Reset to starter
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="text-gold-primary hover:text-gold-light underline"
          >
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
        </div>
      </div>
      <p className="text-xs text-gold-light/80 mb-3">
        Paste your HTML letterhead. Put <code className="text-gold-pale bg-black/30 px-1 rounded">{"{{CONTENT}}"}</code> where the block content should appear, and{" "}
        <code className="text-gold-pale bg-black/30 px-1 rounded">{"{{UNSUBSCRIBE_URL}}"}</code> for the unsubscribe link. Scripts, iframes, and inline event handlers are stripped on save.
      </p>

      <div className={`grid gap-3 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full h-96 px-3 py-2 rounded bg-black/30 border border-gold-light/20 text-gold-pale font-mono text-xs leading-relaxed focus:outline-none focus:border-gold-primary"
        />
        {showPreview && (
          <iframe
            title="Custom HTML preview"
            srcDoc={previewHtml}
            className="w-full h-96 rounded bg-white border border-gold-light/20"
            sandbox="allow-same-origin"
          />
        )}
      </div>
    </div>
  );
}
