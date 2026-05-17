/**
 * Skip-to-main-content link for keyboard and screen-reader users.
 * Visually hidden until focused (sr-only + focus reveal), matching WCAG 2.4.1.
 */
const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-3 focus:text-background focus:text-base focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
  >
    Skip to main content
  </a>
);

export default SkipLink;
