import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import SkipLink from "@/components/SkipLink";
import {
  Article as ArticleWrapper,
  ArticleContainer,
  ArticleContent,
  TopShares,
} from "@/components/ArticleComponents";
import ArticlePreview from "@/components/ArticlePreview";
import Section from "@/components/Section";
import {
  GridWrapper,
  GridContent,
} from "@/components/GridContainer";
import NotFound from "@/pages/NotFound";
import { getArticleBySlug } from "@/data/articles";
import { SITE_NAME, SITE_PUBLISHER, absoluteUrl } from "@/config/site";

/**
 * Derive a publication-time ISO 8601 date from the human-readable string
 * stored in articlesData (e.g. "March 20, 2024"). Falls back to undefined if
 * parsing fails so the JSON-LD validator doesn't see a malformed value.
 */
const toIsoDate = (humanDate: string): string | undefined => {
  const parsed = new Date(humanDate);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const Article = () => {
  const { slug } = useParams<{ slug: string }>();

  // Get article data based on slug
  const articleData = slug ? getArticleBySlug(slug) : undefined;

  // Always compute hooks before any early return so hook order stays stable.
  const description = useMemo(() => {
    if (!articleData) return "";
    // Prefer the first paragraph as a meta description (truncated to ~160 chars).
    const firstParagraph = articleData.content.find(
      (block) => block.type === "paragraph" && block.content
    );
    const raw = firstParagraph?.content ?? articleData.subtitle ?? "";
    return raw.length > 160 ? `${raw.slice(0, 157).trimEnd()}…` : raw;
  }, [articleData]);

  const articleUrl = useMemo(
    () => (articleData ? absoluteUrl(`/article/${articleData.slug}`) : ""),
    [articleData]
  );

  const jsonLd = useMemo(() => {
    if (!articleData) return undefined;
    const publishedIso = toIsoDate(articleData.publishDate);
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: articleData.title,
      description,
      image: [absoluteUrl(articleData.heroImage)],
      author: {
        "@type": "Person",
        name: articleData.author.name,
        jobTitle: articleData.author.title,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_PUBLISHER,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/social-card.svg"),
        },
      },
      datePublished: publishedIso,
      dateModified: publishedIso,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl,
      },
      inLanguage: "en",
    };
  }, [articleData, articleUrl, description]);

  // If the slug doesn't match a known article, render the NotFound page
  // inline so the requested URL stays in the address bar (visitors can see
  // exactly which slug was bad, and server logs / analytics keep the real
  // path). NotFound already emits robots:noindex,nofollow via SEO, so search
  // engines won't index the broken URL.
  if (!articleData) {
    return <NotFound />;
  }

  const publishedIso = toIsoDate(articleData.publishDate);

  // Social share URLs use the real article URL on the current origin,
  // not the historical placeholder ("https://example.com/...") which broke sharing.
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(articleData.title);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${articleData.title} | ${SITE_NAME}`}
        titleTemplate="absolute"
        description={description}
        canonical={`/article/${articleData.slug}`}
        image={articleData.heroImage}
        type="article"
        publishedTime={publishedIso}
        modifiedTime={publishedIso}
        author={articleData.author.name}
        jsonLd={jsonLd}
      />
      <SkipLink />
      <Header />

      <main id="main-content" tabIndex={-1}>
        <ArticleWrapper>
          {/* Title-Dominant Hero Section */}
          <section className="article-grid relative py-20">
            {/* Main Content Container */}
            <div className="article-hero relative text-center flex flex-col items-center">
              {/* Back Button - Top Left */}
              <div className="w-full mb-4">
                <Link
                  to="/blog"
                  className="inline-flex items-center text-[0.875rem] font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  Back
                </Link>
              </div>

              {/* Massive Title */}
              <h1 className="font-display font-semibold text-[4rem] md:text-[6rem] leading-[1.1] mb-8">
                {articleData.title}
              </h1>

              {/* Author Info */}
              <div className="flex items-center gap-4 mb-12">
                <div className="w-[3.125rem] h-[3.125rem] rounded-full overflow-hidden">
                  <img
                    src={articleData.author.avatar}
                    alt={articleData.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-sans text-left">
                  <p className="text-[1rem] leading-none font-semibold text-foreground mb-0.5">
                    {articleData.author.name}
                  </p>
                  <p className="text-[0.875rem] leading-none text-muted-foreground">
                    {articleData.author.title}
                  </p>
                </div>
              </div>

              {/* Hero Image - Full Width */}
              <div className="w-full aspect-square overflow-hidden">
                <img
                  src={articleData.heroImage}
                  alt={articleData.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </section>

          <ArticleContainer>
            <ArticleContent>
              <time
                dateTime={publishedIso}
                className="block text-muted-foreground text-[0.875rem] font-sans tracking-wide mb-8"
              >
                {articleData.publishDate}
              </time>
              {articleData.content.map((block, index) => {
                switch (block.type) {
                  case "paragraph":
                    return <p key={index}>{block.content}</p>;

                  case "heading":
                    return block.level === 2 ? (
                      <h2 key={index}>{block.content}</h2>
                    ) : (
                      <h3 key={index}>{block.content}</h3>
                    );

                  case "image":
                    return (
                      <figure key={index} className="my-12">
                        <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
                          <img
                            src={block.src}
                            alt={block.alt ?? ""}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        {block.caption && (
                          <figcaption className="mt-3 text-sm text-center text-muted-foreground">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    );

                  case "blockquote-big":
                    return (
                      <figure key={index} className="blockquote-big">
                        <blockquote>{block.content}</blockquote>
                        {block.author && <figcaption>{block.author}</figcaption>}
                      </figure>
                    );

                  default:
                    return null;
                }
              })}
            </ArticleContent>

            {/* Social Share Section */}
            <div className="article-hero mt-16 mb-8">
              <h3 className="font-display font-semibold text-[1.25rem] text-center mb-6 text-muted-foreground">
                Share This Article
              </h3>
              <div className="flex justify-center">
                <TopShares
                  facebookUrl={facebookUrl}
                  twitterUrl={twitterUrl}
                  linkedinUrl={linkedinUrl}
                />
              </div>
            </div>
          </ArticleContainer>
        </ArticleWrapper>

        {/* Related Article */}
        <Section>
          <GridWrapper>
            <GridContent>
              <div className="article-full-width">
                <h2 className="text-[2.25rem] md:text-[3rem] font-display font-bold mb-12 text-center">
                  Related Article
                </h2>

                <div className="max-w-[600px] mx-auto">
                  {articleData.relatedArticles.slice(0, 1).map((article) => (
                    <ArticlePreview
                      key={article.slug}
                      title={article.title}
                      slug={article.slug}
                      image={article.image}
                      imageAlt={article.title}
                      publishDate="Recent"
                    />
                  ))}
                </div>
              </div>
            </GridContent>
          </GridWrapper>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default Article;
