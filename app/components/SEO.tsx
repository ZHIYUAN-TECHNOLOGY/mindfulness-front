interface Props {
  title: string;
  description: string;
  keywords: string;
  ogImage: string | null;
  canonicalUrl: string;
  ogType?: string;
  twitterHandle?: string;
}

export function SEO({
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  ogType = "website",
  twitterHandle,
}: Props) {
  const image = ogImage || "";
  const twitterSite = twitterHandle ? `@${twitterHandle.replace(/^@/, "")}` : "";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
    </>
  );
}
