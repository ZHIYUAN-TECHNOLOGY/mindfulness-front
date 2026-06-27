import { useState } from "react";
import { NewsletterEditor } from "./NewsletterEditor";
import { NewsletterTemplateGallery } from "./NewsletterTemplateGallery";
import { NewsletterTemplateOptions } from "./NewsletterTemplateOptions";
import { NewsletterCustomHtml } from "./NewsletterCustomHtml";
import type { EmailBlock, TemplateKey, TemplateOptions } from "../shared";

export interface NewsletterFormValues {
  subject: string;
  preheader: string;
  blocks: EmailBlock[];
  templateKey: TemplateKey;
  templateOptions: TemplateOptions;
  customHtml: string;
}

interface Props {
  initial: NewsletterFormValues;
  submitLabel: string;
  savingLabel: string;
  onSubmit: (values: NewsletterFormValues) => Promise<void>;
  heading: string;
  subheading?: string;
}

export function NewsletterForm({
  initial,
  submitLabel,
  savingLabel,
  onSubmit,
  heading,
  subheading,
}: Props) {
  const [subject, setSubject] = useState(initial.subject);
  const [preheader, setPreheader] = useState(initial.preheader);
  const [blocks, setBlocks] = useState<EmailBlock[]>(initial.blocks);
  const [templateKey, setTemplateKey] = useState<TemplateKey>(initial.templateKey);
  const [templateOptions, setTemplateOptions] = useState<TemplateOptions>(initial.templateOptions);
  const [customHtml, setCustomHtml] = useState<string>(initial.customHtml);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!subject.trim()) return setError("Subject is required");
    if (blocks.length === 0) return setError("Add at least one block");
    if (templateKey === "custom" && !customHtml.trim()) {
      return setError("Paste your custom HTML or pick a preset template");
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        subject: subject.trim(),
        preheader: preheader.trim(),
        blocks,
        templateKey,
        templateOptions,
        customHtml,
      });
    } catch (err: any) {
      setError(err.message || "Failed to save");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{heading}</h1>
      {subheading && <p className="text-sm text-gold-light/80 mb-6">{subheading}</p>}

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gold-pale mb-3 uppercase tracking-wider">
          1 · Choose a template
        </h2>
        <NewsletterTemplateGallery value={templateKey} onChange={setTemplateKey} />
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gold-pale mb-3 uppercase tracking-wider">
          2 · Letterhead
        </h2>
        {templateKey === "custom" ? (
          <NewsletterCustomHtml value={customHtml} onChange={setCustomHtml} />
        ) : (
          <NewsletterTemplateOptions
            templateKey={templateKey}
            value={templateOptions}
            onChange={setTemplateOptions}
          />
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gold-pale mb-3 uppercase tracking-wider">
          3 · Subject &amp; preheader
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preheader (optional)</label>
            <input
              type="text"
              value={preheader}
              onChange={(e) => setPreheader(e.target.value)}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary"
            />
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gold-pale mb-3 uppercase tracking-wider">
          4 · Content blocks
        </h2>
        <NewsletterEditor blocks={blocks} onChange={setBlocks} />
      </section>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="flex gap-3 mt-6 sticky bottom-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2 rounded bg-gold-primary text-brown-dark font-semibold hover:bg-gold-light transition disabled:opacity-50 shadow-lg"
        >
          {saving ? savingLabel : submitLabel}
        </button>
      </div>
    </div>
  );
}
