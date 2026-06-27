import type { TemplateKey, TemplateOptions } from "../shared";

interface Field {
  key: keyof TemplateOptions;
  label: string;
  placeholder?: string;
  show: TemplateKey[];
  type?: "text" | "url" | "textarea";
}

const FIELDS: Field[] = [
  { key: "issueNumber", label: "Issue number", placeholder: "No. 14", show: ["editorial", "weekly-digest"] },
  { key: "eyebrow", label: "Eyebrow / kicker", placeholder: "On Stillness", show: ["editorial", "weekly-digest", "announcement"] },
  { key: "greeting", label: "Greeting", placeholder: "Dear friend,", show: ["mindful-note"] },
  { key: "signature", label: "Signature", placeholder: "— Charles", show: ["mindful-note"] },
  { key: "signoff", label: "Sign-off line", placeholder: "Sent quietly, on purpose.", show: ["editorial"] },
  { key: "portraitUrl", label: "Portrait URL", placeholder: "https://…/portrait.jpg", show: ["mindful-note"], type: "url" },
  { key: "heroImageUrl", label: "Hero image URL", placeholder: "https://…/hero.jpg", show: ["announcement"], type: "url" },
  { key: "footerAddress", label: "Footer line", placeholder: "A small studio · Kuala Lumpur", show: ["editorial", "mindful-note", "weekly-digest", "announcement"] },
  { key: "siteUrl", label: "Site URL", placeholder: "https://charleslee.co", show: ["editorial", "mindful-note", "weekly-digest"], type: "url" },
];

interface Props {
  templateKey: TemplateKey;
  value: TemplateOptions;
  onChange: (next: TemplateOptions) => void;
}

export function NewsletterTemplateOptions({ templateKey, value, onChange }: Props) {
  const fields = FIELDS.filter((f) => f.show.includes(templateKey));
  if (fields.length === 0) return null;

  return (
    <div className="rounded-lg border border-gold-light/20 bg-brown-dark p-4">
      <h4 className="text-sm font-semibold text-gold-pale mb-3">Letterhead fields</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
            <label className="block text-xs font-medium text-gold-light mb-1">{f.label}</label>
            <input
              type={f.type === "url" ? "url" : "text"}
              value={(value[f.key] as string | undefined) || ""}
              onChange={(e) =>
                onChange({ ...value, [f.key]: e.target.value || undefined })
              }
              placeholder={f.placeholder}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
