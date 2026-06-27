export const COLORS = {
  paper: "#F4EFE4",
  paperWarm: "#FBF8F1",
  paperSoft: "#EDE6D6",
  ink: "#181410",
  inkSoft: "#3A322A",
  inkMute: "#6B6055",
  honey: "#B8923D",
  honeyDeep: "#8C6A22",
  honeyLight: "#D9B664",
  line: "rgba(24,20,16,0.12)",
} as const;

export const FONTS = {
  serif: `'Fraunces', 'Cormorant Garamond', Georgia, serif`,
  sans: `'Outfit', 'Helvetica Neue', Arial, sans-serif`,
  mono: `'JetBrains Mono', 'SF Mono', Menlo, monospace`,
  script: `'Caveat', 'Snell Roundhand', cursive`,
} as const;

export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@400;500;600;700&family=Caveat:wght@500&display=swap');`;
