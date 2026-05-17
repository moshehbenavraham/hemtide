import { useEffect } from "react";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_OG_IMAGE,
  SITE_TAGLINE,
  SITE_TWITTER,
  absoluteUrl,
} from "@/config/site";

type JsonLd = Record<string, unknown> | Record<string, unknown>[];

interface SEOProps {
  /** Page-specific title. Will be suffixed with the site name unless `titleTemplate` is "absolute". */
  title?: string;
  titleTemplate?: "default" | "absolute";
  description?: string;
  /** Path-relative or absolute canonical URL. Defaults to the current location. */
  canonical?: string;
  /** Path-relative or absolute social share image. */
  image?: string;
  /** og:type — "website", "article", "profile", etc. */
  type?: string;
  /** Article-specific metadata (rendered when type === "article"). */
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  /** Prevent indexing (used on 404). */
  noindex?: boolean;
  /** Optional structured data injected as <script type="application/ld+json">. */
  jsonLd?: JsonLd;
}

const SEO_META_FLAG = "data-managed-seo";

/**
 * Sets or replaces a `<meta>` tag in document.head, tagging it so we can
 * deterministically clean up on unmount or page change.
 */
const setMeta = (attr: "name" | "property", key: string, value: string) => {
  if (!value) return;
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute(SEO_META_FLAG, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
};

const setLink = (rel: string, href: string) => {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute(SEO_META_FLAG, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const removeMeta = (attr: "name" | "property", key: string) => {
  const el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (el) el.remove();
};

const SCRIPT_ID = "managed-seo-jsonld";

const SEO = ({
  title,
  titleTemplate = "default",
  description = SITE_DESCRIPTION,
  canonical,
  image = SITE_OG_IMAGE,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  noindex = false,
  jsonLd,
}: SEOProps) => {
  useEffect(() => {
    // Title
    const fullTitle =
      !title || titleTemplate === "absolute"
        ? title ?? `${SITE_NAME} — ${SITE_TAGLINE}`
        : `${title} — ${SITE_NAME}`;
    document.title = fullTitle;

    // Description
    setMeta("name", "description", description);

    // Canonical
    const canonicalUrl = canonical
      ? canonical.startsWith("http")
        ? canonical
        : absoluteUrl(canonical)
      : absoluteUrl(window.location.pathname + window.location.search);
    setLink("canonical", canonicalUrl);

    // Open Graph
    const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:site_name", SITE_NAME);

    if (type === "article") {
      if (publishedTime)
        setMeta("property", "article:published_time", publishedTime);
      if (modifiedTime)
        setMeta("property", "article:modified_time", modifiedTime);
      if (author) setMeta("property", "article:author", author);
    }

    // Twitter Card. Skip `twitter:site` / `twitter:creator` entirely when no
    // real handle is configured — emitting a fictional handle pollutes share
    // cards and triggers validator warnings.
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);
    if (SITE_TWITTER) {
      setMeta("name", "twitter:site", SITE_TWITTER);
      if (author) setMeta("name", "twitter:creator", SITE_TWITTER);
    } else {
      removeMeta("name", "twitter:site");
      removeMeta("name", "twitter:creator");
    }

    // Robots
    setMeta(
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"
    );

    // JSON-LD structured data
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) existingScript.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    // Cleanup JSON-LD only on unmount; meta values get overwritten by the next
    // SEO render (so we don't briefly flash an empty head between routes).
    return () => {
      const stale = document.getElementById(SCRIPT_ID);
      if (stale) stale.remove();
    };
  }, [
    title,
    titleTemplate,
    description,
    canonical,
    image,
    type,
    publishedTime,
    modifiedTime,
    author,
    noindex,
    jsonLd,
  ]);

  return null;
};

export default SEO;
