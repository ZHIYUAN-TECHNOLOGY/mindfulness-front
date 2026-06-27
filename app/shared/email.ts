export interface EmailBlock {
  type: "text" | "image" | "button";
  content?: string;
  mediaId?: string;
  alt?: string;
  text?: string;
  url?: string;
  align?: "left" | "center" | "right";
}

import { renderNewsletter } from "./email-templates";

/**
 * Legacy renderer — kept as a thin wrapper over the editorial template so any
 * older callers continue to work. New code should call `renderNewsletter`.
 */
export function renderEmailHtml(opts: {
  subject: string;
  preheader?: string;
  blocks: EmailBlock[];
  unsubscribeUrl: string;
  mediaBaseUrl: string;
}): string {
  return renderNewsletter({
    templateKey: "editorial",
    subject: opts.subject,
    preheader: opts.preheader,
    blocks: opts.blocks,
    unsubscribeUrl: opts.unsubscribeUrl,
    mediaBaseUrl: opts.mediaBaseUrl,
  });
}
