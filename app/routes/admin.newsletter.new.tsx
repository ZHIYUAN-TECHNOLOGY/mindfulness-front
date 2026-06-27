import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { apiFetch } from "../lib/api";
import { NewsletterForm } from "../components/NewsletterForm";

export const Route = createFileRoute("/admin/newsletter/new")({
  component: NewNewsletterPage,
});

function NewNewsletterPage() {
  const navigate = useNavigate();

  return (
    <NewsletterForm
      heading="Create Newsletter"
      subheading="Pick a letterhead, fill in the fields, then write your content blocks below."
      submitLabel="Save Draft"
      savingLabel="Saving..."
      initial={{
        subject: "",
        preheader: "",
        blocks: [{ type: "text", content: "" }],
        templateKey: "editorial",
        templateOptions: {},
        customHtml: "",
      }}
      onSubmit={async (values) => {
        const data = await apiFetch("/api/newsletter", {
          method: "POST",
          body: JSON.stringify({
            subject: values.subject,
            preheader: values.preheader || undefined,
            blocks: values.blocks,
            templateKey: values.templateKey,
            templateOptions: values.templateOptions,
            customHtml: values.templateKey === "custom" ? values.customHtml : undefined,
          }),
        });
        navigate({ to: `/admin/newsletter/${data.newsletter.id}` });
      }}
    />
  );
}
