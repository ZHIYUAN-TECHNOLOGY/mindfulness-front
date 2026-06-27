import { COLORS, FONTS } from "./tokens";
import type { EmailBlock } from "../email";

export interface RenderBlocksOptions {
  blocks: EmailBlock[];
  mediaBaseUrl: string;
  /** Set true when the host template already provides outer padding (e.g. inside a card). */
  flush?: boolean;
}

const wrap = (inner: string, flush: boolean) =>
  flush
    ? `<div style="font-family:${FONTS.sans};font-size:17px;line-height:1.72;color:${COLORS.inkSoft};">${inner}</div>`
    : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${inner}</table>`;

export function renderBlocks(opts: RenderBlocksOptions): string {
  const rows = opts.blocks
    .map((block) => {
      switch (block.type) {
        case "text":
          return opts.flush
            ? `<div style="margin:0 0 14px 0;">${block.content ?? ""}</div>`
            : `<tr><td style="padding:12px 0;font-family:${FONTS.sans};font-size:17px;line-height:1.72;color:${COLORS.inkSoft};">${block.content ?? ""}</td></tr>`;
        case "image": {
          const src = block.mediaId
            ? block.mediaId.startsWith("http")
              ? block.mediaId
              : `${opts.mediaBaseUrl}/${block.mediaId}/content`
            : "";
          const img = `<img src="${src}" alt="${block.alt ?? ""}" style="max-width:100%;height:auto;display:block;border-radius:6px;" />`;
          return opts.flush
            ? `<div style="margin:18px 0;">${img}</div>`
            : `<tr><td style="padding:14px 0;">${img}</td></tr>`;
        }
        case "button": {
          const align = block.align || "center";
          const btn = `<a href="${block.url ?? "#"}" style="display:inline-block;padding:14px 28px;background:${COLORS.ink};color:${COLORS.paper};text-decoration:none;border-radius:999px;font-family:${FONTS.sans};font-size:15px;font-weight:500;letter-spacing:.04em;">${block.text ?? ""} <span style="color:${COLORS.honeyLight};">→</span></a>`;
          return opts.flush
            ? `<div style="text-align:${align};margin:22px 0;">${btn}</div>`
            : `<tr><td style="padding:16px 0;text-align:${align};">${btn}</td></tr>`;
        }
        default:
          return "";
      }
    })
    .join("");

  return wrap(rows, opts.flush ?? false);
}
