import type { EmailBlock } from "../email";
import { editorialTemplate } from "./editorial";
import { mindfulNoteTemplate } from "./mindful-note";
import { weeklyDigestTemplate } from "./weekly-digest";
import { announcementTemplate } from "./announcement";
import { customTemplate } from "./custom";
import { renderBlocks } from "./blocks";
import type {
  NewsletterTemplate,
  TemplateContext,
  TemplateKey,
  TemplateOptions,
} from "./types";

export type { NewsletterTemplate, TemplateContext, TemplateKey, TemplateOptions };
export { STARTER_CUSTOM_HTML } from "./custom";

export const TEMPLATES: Record<TemplateKey, NewsletterTemplate> = {
  editorial: editorialTemplate,
  "mindful-note": mindfulNoteTemplate,
  "weekly-digest": weeklyDigestTemplate,
  announcement: announcementTemplate,
  custom: customTemplate,
};

export const TEMPLATE_LIST: NewsletterTemplate[] = [
  editorialTemplate,
  mindfulNoteTemplate,
  weeklyDigestTemplate,
  announcementTemplate,
  customTemplate,
];

export function getTemplate(key: string | null | undefined): NewsletterTemplate {
  if (!key) return editorialTemplate;
  const found = (TEMPLATES as Record<string, NewsletterTemplate>)[key];
  return found ?? editorialTemplate;
}

export interface RenderNewsletterOptions {
  templateKey: string | null | undefined;
  templateOptions?: TemplateOptions | null;
  customHtml?: string | null;
  subject: string;
  preheader?: string | null;
  blocks: EmailBlock[];
  unsubscribeUrl: string;
  mediaBaseUrl: string;
}

export function renderNewsletter(opts: RenderNewsletterOptions): string {
  const tpl = getTemplate(opts.templateKey);
  const blocksHtml = renderBlocks({
    blocks: opts.blocks,
    mediaBaseUrl: opts.mediaBaseUrl,
    flush: tpl.flushBlocks,
  });
  const options: TemplateOptions = { ...tpl.defaults, ...(opts.templateOptions || {}) };
  const ctx: TemplateContext = {
    subject: opts.subject,
    preheader: opts.preheader || undefined,
    blocksHtml,
    unsubscribeUrl: opts.unsubscribeUrl,
    options,
    customHtml: opts.customHtml || undefined,
  };
  return tpl.wrap(ctx);
}

export interface TemplateMetadata {
  key: TemplateKey;
  name: string;
  description: string;
  defaults: TemplateOptions;
}

export function listTemplateMetadata(): TemplateMetadata[] {
  return TEMPLATE_LIST.map((t) => ({
    key: t.key,
    name: t.name,
    description: t.description,
    defaults: t.defaults,
  }));
}
