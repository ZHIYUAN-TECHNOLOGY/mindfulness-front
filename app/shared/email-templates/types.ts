export interface TemplateOptions {
  brandName?: string;
  authorName?: string;
  issueNumber?: string;
  eyebrow?: string;
  greeting?: string;
  signature?: string;
  signoff?: string;
  footerAddress?: string;
  siteUrl?: string;
  portraitUrl?: string;
  heroImageUrl?: string;
  [key: string]: string | undefined;
}

export interface TemplateContext {
  subject: string;
  preheader?: string;
  blocksHtml: string;
  unsubscribeUrl: string;
  options: TemplateOptions;
  customHtml?: string;
}

export type TemplateKey =
  | "editorial"
  | "mindful-note"
  | "weekly-digest"
  | "announcement"
  | "custom";

export interface NewsletterTemplate {
  key: TemplateKey;
  name: string;
  description: string;
  defaults: TemplateOptions;
  /** If true, blocks are rendered as flow HTML (divs) instead of a wrapping table — for templates that supply their own padding. */
  flushBlocks: boolean;
  wrap(ctx: TemplateContext): string;
}
