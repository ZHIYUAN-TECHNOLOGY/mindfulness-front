export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SCRIPT_TAG = /<script\b[\s\S]*?<\/script\s*>/gi;
const STYLE_BLOCK_ATTR = /\sstyle\s*=\s*"[^"]*expression\([^"]*"/gi;
const IFRAME_TAG = /<iframe\b[\s\S]*?<\/iframe\s*>/gi;
const OBJECT_TAG = /<(object|embed|applet|form|meta|link)\b[\s\S]*?(?:\/>|<\/\1\s*>)/gi;
const EVENT_ATTR = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URL = /(href|src|action|formaction)\s*=\s*("|')\s*javascript:[^"']*\2/gi;

export function sanitizeEmailHtml(html: string): string {
  return html
    .replace(SCRIPT_TAG, "")
    .replace(IFRAME_TAG, "")
    .replace(OBJECT_TAG, "")
    .replace(EVENT_ATTR, "")
    .replace(JAVASCRIPT_URL, "$1=$2#$2")
    .replace(STYLE_BLOCK_ATTR, "");
}
