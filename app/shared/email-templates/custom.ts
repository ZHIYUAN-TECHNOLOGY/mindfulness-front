import type { NewsletterTemplate, TemplateContext } from "./types";
import { sanitizeEmailHtml } from "./escape";

const FALLBACK = `<!doctype html>
<html><body style="margin:0;padding:32px;font-family:Arial,sans-serif;color:#181410;background:#F4EFE4;">
<p>This newsletter has no custom HTML. Edit the draft and paste your letterhead, with <code>{{CONTENT}}</code> where the block content should appear.</p>
</body></html>`;

const HAS_CONTENT = /\{\{\s*CONTENT\s*\}\}/;
const HAS_UNSUB = /\{\{\s*UNSUBSCRIBE_URL\s*\}\}/g;

export function buildCustomHtml(rawHtml: string | undefined, ctx: TemplateContext): string {
  const html = (rawHtml || "").trim();
  if (!html) return FALLBACK;

  const safe = sanitizeEmailHtml(html);
  const withContent = HAS_CONTENT.test(safe)
    ? safe.replace(/\{\{\s*CONTENT\s*\}\}/g, ctx.blocksHtml)
    : safe + ctx.blocksHtml;

  return withContent.replace(HAS_UNSUB, ctx.unsubscribeUrl);
}

function wrap(ctx: TemplateContext): string {
  return buildCustomHtml(ctx.customHtml, ctx);
}

export const STARTER_CUSTOM_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Custom Newsletter</title>
</head>
<body style="margin:0;padding:0;background:#F4EFE4;font-family:Arial,sans-serif;color:#181410;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:8px;">
        <tr><td style="padding:48px;">

          <!-- Your custom header / hero / branding HTML goes here -->

          {{CONTENT}}

          <!-- Your custom signoff / footer HTML goes here -->

          <div style="margin-top:32px;padding-top:18px;border-top:1px solid #eee;font-size:12px;color:#888;">
            <a href="{{UNSUBSCRIBE_URL}}" style="color:#888;">Unsubscribe</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const customTemplate: NewsletterTemplate = {
  key: "custom",
  name: "Custom HTML",
  description:
    "Paste your own HTML letterhead. Use {{CONTENT}} where the block content should appear, and {{UNSUBSCRIBE_URL}} for the unsubscribe link. Scripts, iframes, and inline event handlers are stripped on save.",
  defaults: {},
  flushBlocks: true,
  wrap,
};
