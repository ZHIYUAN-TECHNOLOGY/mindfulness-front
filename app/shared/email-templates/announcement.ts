import type { NewsletterTemplate, TemplateContext } from "./types";
import { COLORS, FONTS, FONT_IMPORT } from "./tokens";
import { escapeHtml } from "./escape";

function wrap(ctx: TemplateContext): string {
  const opts = ctx.options;
  const kicker = escapeHtml(opts.eyebrow || "An invitation");
  const footer = escapeHtml(opts.footerAddress || "Mindfulness to Change · Kuala Lumpur");
  const heroImage = opts.heroImageUrl;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(ctx.subject)}</title>
<style>
${FONT_IMPORT}
body{margin:0;padding:0;background:${COLORS.ink};font-family:${FONTS.sans};color:${COLORS.paper};}
a{color:${COLORS.honeyLight};}
@media (max-width:620px){
  .an-outer{padding:24px 14px!important;}
  .an-title{font-size:40px!important;line-height:1.05!important;}
  .an-body{padding:32px 24px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.ink};">
${ctx.preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(ctx.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.ink};">
  <tr><td align="center" class="an-outer" style="padding:48px 24px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

      ${heroImage ? `<tr><td><img src="${escapeHtml(heroImage)}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border-radius:12px 12px 0 0;"/></td></tr>` : ""}

      <tr><td class="an-body" style="background:${COLORS.paperWarm};color:${COLORS.ink};padding:56px 56px 48px 56px;border-radius:${heroImage ? "0 0 12px 12px" : "12px"};">
        <div style="font-size:12px;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:${COLORS.honeyDeep};margin-bottom:18px;">${kicker}</div>
        <div class="an-title" style="font-family:${FONTS.serif};font-size:56px;line-height:1;letter-spacing:-.02em;color:${COLORS.ink};margin-bottom:26px;">${escapeHtml(ctx.subject)}</div>

        <div style="font-size:17px;line-height:1.7;color:${COLORS.inkSoft};">
          ${ctx.blocksHtml}
        </div>
      </td></tr>

      <tr><td style="padding-top:32px;text-align:center;font-size:12px;color:${COLORS.inkMute};line-height:1.7;">
        <div>${footer}</div>
        <div><a href="${ctx.unsubscribeUrl}" style="color:${COLORS.inkMute};text-decoration:underline;">Unsubscribe</a></div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export const announcementTemplate: NewsletterTemplate = {
  key: "announcement",
  name: "The Announcement",
  description:
    "Single big message — event invite, book launch, retreat. Dark frame, full-bleed hero, one strong heading. Add a CTA block in the body.",
  defaults: {
    eyebrow: "An invitation",
    footerAddress: "Mindfulness to Change · Kuala Lumpur",
  },
  flushBlocks: true,
  wrap,
};
