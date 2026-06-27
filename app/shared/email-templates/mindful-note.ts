import type { NewsletterTemplate, TemplateContext } from "./types";
import { COLORS, FONTS, FONT_IMPORT } from "./tokens";
import { escapeHtml } from "./escape";

function wrap(ctx: TemplateContext): string {
  const opts = ctx.options;
  const greeting = escapeHtml(opts.greeting || "Dear friend,");
  const signature = escapeHtml(opts.signature || "— Charles");
  const footerLine = escapeHtml(opts.footerAddress || "Mindfulness to Change · Kuala Lumpur");
  const siteUrl = opts.siteUrl || "https://charleslee.co";
  const portrait = opts.portraitUrl;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(ctx.subject)}</title>
<style>
${FONT_IMPORT}
body{margin:0;padding:0;background:${COLORS.paperWarm};font-family:${FONTS.serif};color:${COLORS.inkSoft};}
a{color:${COLORS.honeyDeep};}
@media (max-width:620px){
  .mn-outer{padding:32px 18px!important;}
  .mn-body{font-size:18px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.paperWarm};">
${ctx.preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(ctx.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="center" class="mn-outer" style="padding:64px 24px;">
    <table role="presentation" width="540" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;">

      ${portrait ? `<tr><td align="center" style="padding-bottom:32px;"><img src="${escapeHtml(portrait)}" alt="" width="80" height="80" style="width:80px;height:80px;border-radius:50%;display:block;border:1px solid ${COLORS.line};"/></td></tr>` : ""}

      <tr><td style="font-family:${FONTS.serif};font-style:italic;font-size:24px;color:${COLORS.ink};padding-bottom:20px;">${greeting}</td></tr>

      <tr><td class="mn-body" style="font-family:${FONTS.serif};font-size:19px;line-height:1.75;color:${COLORS.inkSoft};">
        ${ctx.blocksHtml}
      </td></tr>

      <tr><td style="padding-top:36px;font-family:${FONTS.script};font-size:36px;color:${COLORS.ink};">${signature}</td></tr>

      <tr><td style="padding-top:60px;font-family:${FONTS.sans};font-size:12px;color:${COLORS.inkMute};line-height:1.7;border-top:1px solid ${COLORS.line};">
        <div style="padding-top:18px;">${footerLine}</div>
        <div><a href="${siteUrl}" style="color:${COLORS.inkMute};text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a> · <a href="${ctx.unsubscribeUrl}" style="color:${COLORS.inkMute};">Unsubscribe</a></div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export const mindfulNoteTemplate: NewsletterTemplate = {
  key: "mindful-note",
  name: "The Mindful Note",
  description:
    "Reads like a personal letter from Dr. Charles. Round portrait, long-form serif body, script signature. Best for thoughtful essays.",
  defaults: {
    greeting: "Dear friend,",
    signature: "— Charles",
    footerAddress: "Mindfulness to Change · Kuala Lumpur",
  },
  flushBlocks: true,
  wrap,
};
