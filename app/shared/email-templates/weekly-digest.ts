import type { NewsletterTemplate, TemplateContext } from "./types";
import { COLORS, FONTS, FONT_IMPORT } from "./tokens";
import { escapeHtml } from "./escape";

function wrap(ctx: TemplateContext): string {
  const opts = ctx.options;
  const brandName = escapeHtml(opts.brandName || "Mindfulness to Change");
  const issue = escapeHtml(opts.issueNumber || "This week");
  const eyebrow = escapeHtml(opts.eyebrow || "Featured · This Letter");
  const footer = escapeHtml(opts.footerAddress || "Kuala Lumpur");
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
  .wd-outer{padding:32px 14px!important;}
  .wd-feature{padding:24px 22px 22px 22px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.paper};">
${ctx.preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(ctx.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.paper};">
  <tr><td align="center" class="wd-outer" style="padding:48px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

      <tr><td style="padding-bottom:14px;">
        <table width="100%"><tr>
          <td align="left" style="font-size:12px;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:${COLORS.honeyDeep};">${brandName}</td>
          <td align="right" style="font-family:${FONTS.serif};font-style:italic;font-size:14px;color:${COLORS.inkMute};">${issue}</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding-bottom:32px;"><div style="height:2px;background:${COLORS.honey};"></div></td></tr>

      <tr><td style="background:${COLORS.paperWarm};border:1px solid ${COLORS.line};border-radius:12px;overflow:hidden;">
        <div class="wd-feature" style="padding:32px 32px 28px 32px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:${COLORS.honeyDeep};margin-bottom:10px;">${eyebrow}</div>
          <div style="font-family:${FONTS.serif};font-size:32px;line-height:1.1;color:${COLORS.ink};margin-bottom:18px;">${escapeHtml(ctx.subject)}</div>
          <div style="font-size:15px;line-height:1.7;color:${COLORS.inkSoft};">
            ${ctx.blocksHtml}
          </div>
        </div>
      </td></tr>

      <tr><td style="padding-top:48px;font-size:12px;color:${COLORS.inkMute};line-height:1.7;border-top:1px solid ${COLORS.line};">
        <div style="padding-top:18px;">
          <strong style="color:${COLORS.ink};font-weight:600;">${brandName}</strong> · ${footer} ·
          <a href="${siteUrl}" style="color:${COLORS.inkMute};text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a> ·
          <a href="${ctx.unsubscribeUrl}" style="color:${COLORS.inkMute};">Unsubscribe</a>
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export const weeklyDigestTemplate: NewsletterTemplate = {
  key: "weekly-digest",
  name: "The Weekly Digest",
  description:
    "Magazine-style. Featured story with framed card. Best for round-ups, podcast notes, or week-in-review letters.",
  defaults: {
    brandName: "Mindfulness to Change",
    issueNumber: "This week",
    eyebrow: "Featured · This Letter",
    footerAddress: "Kuala Lumpur",
  },
  flushBlocks: true,
  wrap,
};
