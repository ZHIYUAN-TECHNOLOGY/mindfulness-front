export function getYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function getYouTubeThumbnailUrl(url: string, quality: "default" | "hq" | "mq" | "sd" | "max" = "hq"): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  const qualityMap = {
    default: "default",
    hq: "hqdefault",
    mq: "mqdefault",
    sd: "sddefault",
    max: "maxresdefault",
  };
  return `https://i.ytimg.com/vi/${id}/${qualityMap[quality]}.jpg`;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}
