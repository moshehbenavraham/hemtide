import { Link } from "react-router-dom";
import NewsletterSheet from "@/components/NewsletterSheet";
import { SITE_PUBLISHER } from "@/config/site";

/**
 * Site-wide footer. Replaces the duplicated copyright blocks that used to live
 * on every page, with a dynamic copyright year, navigation links, and a
 * newsletter entry point.
 */
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-t border-border mt-24"
      aria-label="Site footer"
    >
      <div className="article-grid py-12">
        <div className="article-hero">
          <div className="flex flex-col items-center gap-6 text-sm text-muted-foreground md:flex-row md:justify-between">
            <p className="font-medium text-foreground">
              © {year} {SITE_PUBLISHER}. All rights reserved.
            </p>
            <nav aria-label="Footer">
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/article/about-james"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <NewsletterSheet>
                    <button
                      type="button"
                      className="hover:text-foreground transition-colors"
                    >
                      Newsletter
                    </button>
                  </NewsletterSheet>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
