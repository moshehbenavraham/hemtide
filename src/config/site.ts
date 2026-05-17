/**
 * Single source of truth for site-wide identity and SEO defaults.
 *
 * Update SITE_URL to your production canonical domain before deploying — it's
 * used for absolute URLs in JSON-LD, Open Graph tags, the sitemap, and canonical
 * links when window.location is unavailable (build-time / crawler prefetch).
 */
export const SITE_URL = "https://voyager.press";
export const SITE_NAME = "Voyager";
export const SITE_PUBLISHER = "Voyager Press";
export const SITE_TAGLINE = "Fashion Photography Magazine";
export const SITE_DESCRIPTION =
  "Voyager Press is an editorial fashion magazine covering photography, beauty campaigns, streetwear, accessories, and style culture.";

/**
 * Twitter @handle, including the leading "@". Set to null until a real account
 * exists — the SEO component will skip emitting `twitter:site` / `twitter:creator`
 * when this is null rather than ship a fictional handle that pollutes share cards.
 */
export const SITE_TWITTER: string | null = null;
export const SITE_OG_IMAGE = "/social-card.svg";

/**
 * Contact addresses for the publication, derived from SITE_URL's hostname so the
 * mailto: drafts and Privacy Policy contact rows match the canonical domain.
 * Override per-environment via VITE_CONTACT_EMAIL if needed.
 */
export const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL?.trim() || "hello@voyager.press";
export const PRESS_EMAIL = "press@voyager.press";
export const PRIVACY_EMAIL = "privacy@voyager.press";

/**
 * Last "meaningful" edit date for the Privacy Policy. Bump this whenever the
 * policy text is updated so the rendered "Last Updated" line stays accurate
 * without requiring code edits to the page itself.
 */
export const PRIVACY_POLICY_UPDATED = "May 15, 2026";

/**
 * Social profile URLs for the publication. Every entry defaults to null so we
 * never ship dead links to platform homepages (instagram.com, twitter.com, etc.)
 * — set a value when a real profile exists. The Contact page renders only the
 * entries returned by getActiveSocialLinks().
 */
export type SocialPlatform =
  | "instagram"
  | "twitter"
  | "linkedin"
  | "facebook"
  | "youtube"
  | "tiktok";

export const SOCIAL_LINKS: Record<SocialPlatform, string | null> = {
  instagram: null,
  twitter: null,
  linkedin: null,
  facebook: null,
  youtube: null,
  tiktok: null,
};

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
};

/** Returns only the social links that have been populated with real URLs. */
export const getActiveSocialLinks = (): Array<{
  platform: SocialPlatform;
  label: string;
  href: string;
}> =>
  (Object.entries(SOCIAL_LINKS) as Array<[SocialPlatform, string | null]>)
    .filter((entry): entry is [SocialPlatform, string] => entry[1] !== null)
    .map(([platform, href]) => ({
      platform,
      label: SOCIAL_LABELS[platform],
      href,
    }));

/**
 * Build an absolute URL for the current site. Prefers the live origin (so
 * preview deploys produce correct canonicals) and falls back to SITE_URL.
 */
export const absoluteUrl = (path: string = "/"): string => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : SITE_URL;
  return `${origin}${normalized}`;
};
