import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { NewsletterForm, type NewsletterFormValues } from "../components/NewsletterForm";
import type { EmailBlock, TemplateKey, TemplateOptions } from "../shared";

export const Route = createFileRoute("/admin/newsletter/$id/edit")({
  component: EditNewsletterPage,
});

function EditNewsletterPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<NewsletterFormValues | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/newsletter/${id}`)
      .then((data) => {
        const nl = data.newsletter;
        if (nl.status !== "draft") {
          setError("Only drafts can be edited.");
          return;
        }
        setInitial({
          subject: nl.subject || "",
          preheader: nl.preheader || "",
          blocks: (nl.blocks as EmailBlock[]) || [{ type: "text", content: "" }],
          templateKey: (nl.templateKey as TemplateKey) || "editorial",
          templateOptions: (nl.templateOptions as TemplateOptions) || {},
          customHtml: nl.customHtml || "",
        });
      })
      .catch((err) => setError(err.message || "Failed to load"));
  }, [id]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-red-300 mb-3">{error}</p>
        <button
          type="button"
          onClick={() => navigate({ to: `/admin/newsletter/${id}` })}
          className="text-sm text-gold-primary hover:text-gold-light underline"
        >
          Back to newsletter
        </button>
      </div>
    );
  }

  if (!initial) {
    return <p className="text-sm opacity-70">Loading...</p>;
  }

  return (
    <NewsletterForm
      heading="Edit Newsletter"
      subheading="Adjust your draft. Changes save back to the same newsletter."
      submitLabel="Save Changes"
      savingLabel="Saving..."
      initial={initial}
      onSubmit={async (values) => {
        await apiFetch(`/api/newsletter/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            subject: values.subject,
            preheader: values.preheader || undefined,
            blocks: values.blocks,
            templateKey: values.templateKey,
            templateOptions: values.templateOptions,
            customHtml: values.templateKey === "custom" ? values.customHtml : undefined,
          }),
        });
        navigate({ to: `/admin/newsletter/${id}` });
      }}
    />
  );
}
