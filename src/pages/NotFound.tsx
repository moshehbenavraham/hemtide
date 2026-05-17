import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Home, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import SkipLink from "@/components/SkipLink";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Surface the missed route in the console so deploys with log capture
    // (Vercel, Netlify, Sentry) can flag broken links.
    console.warn(
      "404 — non-existent route requested:",
      location.pathname + location.search
    );
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        canonical={location.pathname}
        noindex
      />
      <SkipLink />
      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-grow flex items-center"
      >
        <div className="article-grid w-full py-24 md:py-32">
          <div className="article-hero text-center">
            <p
              className="font-display text-[8rem] md:text-[12rem] font-semibold leading-none mb-4 bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--gradient-hero)",
              }}
              aria-hidden="true"
            >
              404
            </p>
            <h1 className="font-display font-semibold text-[3rem] md:text-[4.5rem] leading-[1.1] mb-6">
              We lost this one in the archives.
            </h1>
            <p className="text-[1.6rem] md:text-[1.8rem] text-muted-foreground leading-relaxed max-w-[640px] mx-auto mb-12">
              The page you were looking for doesn't exist — or it might have
              moved. Try one of the routes below, or head back to the latest
              editorial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-[1.5rem] font-medium bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-lg"
              >
                <Home className="h-5 w-5" />
                Back to home
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-[1.5rem] font-medium border border-border text-foreground hover:border-foreground transition-all duration-300 rounded-lg"
              >
                Browse articles
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-[1.5rem] font-medium border border-border text-foreground hover:border-foreground transition-all duration-300 rounded-lg"
              >
                <Mail className="h-5 w-5" />
                Get in touch
              </Link>
            </div>

            {location.pathname && location.pathname !== "/404" && (
              <p className="text-[1.2rem] text-muted-foreground/70 font-mono break-all">
                Requested:{" "}
                <span className="text-muted-foreground">
                  {location.pathname}
                </span>
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
