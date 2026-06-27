import type { NewsletterTemplate, TemplateContext } from "./types";
import { COLORS, FONTS, FONT_IMPORT } from "./tokens";
import { escapeHtml } from "./escape";

function wrap(ctx: TemplateContext): string {
  const opts = ctx.options;
  const issue = escapeHtml(opts.issueNumber || "No. 01");
  const eyebrow = escapeHtml(opts.eyebrow || "A letter");
  const signoff = escapeHtml(
    opts.signoff || "Sent quietly, on purpose. Replies are read."
  );
  const footer = escapeHtml(
    opts.footerAddress || "A small studio · Kuala Lumpur, Malaysia"
  );
  const brandName = escapeHtml(opts.brandName || "Mindfulness to Change");
  const authorName = escapeHtml(opts.authorName || "Dr. Charles Lee");
  const siteUrl = opts.siteUrl || "https://charleslee.co";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(ctx.subject)}</title>
<style>
${FONT_IMPORT}
body{margin:0;padding:0;background:${COLORS.paper};font-family:${FONTS.sans};color:${COLORS.ink};}
a{color:${COLORS.honeyDeep};}
@media (max-width:620px){
  .ed-outer{padding:36px 14px!important;}
  .ed-card{padding:32px 24px!important;border-radius:10px!important;}
  .ed-title{font-size:36px!important;line-height:1.04!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.paper};">
${ctx.preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(ctx.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.paper};">
  <tr><td align="center" class="ed-outer" style="padding:56px 16px;">

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
      <tr><td style="padding-bottom:18px;">
        <table width="100%"><tr>
          <td align="left">
            <div style="font-size:12px;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:${COLORS.honeyDeep};">${brandName}</div>
            <div style="font-family:${FONTS.serif};font-style:italic;font-size:30px;color:${COLORS.ink};margin-top:8px;">${authorName}</div>
          </td>
          <td align="right" valign="middle" width="80" style="font-family:${FONTS.serif};font-style:italic;font-size:14px;color:${COLORS.inkMute};">${issue}</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding-bottom:32px;">
        <div style="height:2px;background:${COLORS.honey};"></div>
        <div style="height:1px;background:${COLORS.honeyLight};"></div>
      </td></tr>
    </table>

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="ed-card" style="max-width:600px;background:${COLORS.paperWarm};border:1px solid ${COLORS.line};border-radius:14px;box-shadow:0 24px 64px -32px rgba(24,20,16,.18);">
      <tr><td style="padding:52px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:${COLORS.honeyDeep};margin-bottom:18px;">— ${eyebrow}</div>
        <div class="ed-title" style="font-family:${FONTS.serif};font-size:48px;line-height:1;letter-spacing:-.024em;color:${COLORS.ink};margin-bottom:26px;">${escapeHtml(ctx.subject)}</div>

        ${ctx.blocksHtml}

        <div style="margin-top:32px;padding-top:26px;border-top:1px solid ${COLORS.line};font-family:${FONTS.serif};font-style:italic;font-size:17px;color:${COLORS.inkSoft};">${signoff}</div>
      </td></tr>
    </table>

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin-top:32px;">
      <tr>
        <td align="left" style="font-size:12px;line-height:1.7;color:${COLORS.inkMute};">
          <strong style="color:${COLORS.ink};font-weight:600;">${brandName}</strong><br/>
          ${footer}
        </td>
        <td align="right" style="font-size:12px;line-height:1.7;color:${COLORS.inkMute};">
          <a href="${siteUrl}" style="color:${COLORS.inkMute};text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a><br/>
          <a href="${ctx.unsubscribeUrl}" style="color:${COLORS.inkMute};text-decoration:underline;">Unsubscribe</a>
        </td>
      </tr>
    </table>

  </td></tr>
</table>
</body>
</html>`;
}

export const editorialTemplate: NewsletterTemplate = {
  key: "editorial",
  name: "The Editorial Letter",
  description:
    "Matches the site brand — Fraunces italic name, gold hairline rule, cream card. Same vocabulary as your sign-in email.",
  defaults: {
    issueNumber: "No. 01",
    eyebrow: "A letter",
    signoff: "Sent quietly, on purpose. Replies are read.",
    footerAddress: "A small studio · Kuala Lumpur, Malaysia",
  },
  flushBlocks: true,
  wrap,
};
