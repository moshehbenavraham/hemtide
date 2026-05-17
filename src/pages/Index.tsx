import { useEffect, useRef, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import SkipLink from "@/components/SkipLink";
import Section from "@/components/Section";
import ArticlePreview from "@/components/ArticlePreview";
import BlogHero from "@/components/BlogHero";
import WavyBackground from "@/components/WavyBackground";
import {
  GridContainer,
  GridContent,
  GridWrapper,
} from "@/components/GridContainer";
import { articlesData } from "@/data/articles";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_PUBLISHER,
  SITE_TAGLINE,
  absoluteUrl,
} from "@/config/site";

const Index = () => {
  const articlesRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Honor users with reduced-motion preferences (WCAG 2.3.3) — skip the
    // scroll-triggered fade-in entirely and let the CSS reduced-motion rule
    // render every card at full opacity in its natural position.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeInUp");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    articlesRef.current.forEach((article) => {
      if (article) observer.observe(article);
    });

    return () => observer.disconnect();
  }, []);

  // Transform articlesData into the format needed for the article grid
  const allArticles = useMemo(() => {
    return Object.values(articlesData).map((article) => ({
      title: article.title,
      image: article.heroImage,
      publishDate: article.publishDate,
      slug: article.slug,
    }));
  }, []);

  const jsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        alternateName: SITE_PUBLISHER,
        description: SITE_DESCRIPTION,
        url: absoluteUrl("/"),
        publisher: {
          "@type": "Organization",
          name: SITE_PUBLISHER,
        },
        inLanguage: "en",
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${SITE_NAME} — Latest Articles`,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        numberOfItems: allArticles.length,
        itemListElement: allArticles.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/article/${article.slug}`),
          name: article.title,
        })),
      },
    ],
    [allArticles]
  );

  return (
    <div className="min-h-screen bg-background relative">
      <SEO
        title={`${SITE_NAME} — ${SITE_TAGLINE}`}
        titleTemplate="absolute"
        description={SITE_DESCRIPTION}
        canonical="/"
        type="website"
        jsonLd={jsonLd}
      />
      <SkipLink />
      <WavyBackground />
      <Header />

      <main id="main-content" tabIndex={-1}>
        <Section>
          <GridWrapper>
            <GridContent className="!mt-0 !mb-0">
              <BlogHero
                title="Voyager"
                description="Voyager Press is an editorial fashion magazine covering photography, beauty campaigns, streetwear, accessories, and style culture."
              />
            </GridContent>
          </GridWrapper>
        </Section>

        {/* Articles Section - Accordion Grid */}
        <Section>
          <GridWrapper>
            <GridContent>
              <div className="article-full-width">
                <ul
                  className="article-two-columns"
                  aria-label={`Latest articles from ${SITE_NAME}`}
                >
                  {allArticles.map((article, index) => (
                    <li
                      key={article.slug}
                      ref={(el) => (articlesRef.current[index] = el)}
                      className="blog-feed__item"
                      style={{
                        animationDelay: `${(index % 2) * 150}ms`,
                      }}
                    >
                      <ArticlePreview
                        title={article.title}
                        slug={article.slug}
                        image={article.image}
                        imageAlt={article.title}
                        publishDate={article.publishDate}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </GridContent>
          </GridWrapper>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
