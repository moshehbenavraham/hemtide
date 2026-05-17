import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  HAS_NEWSLETTER_ENDPOINT,
  subscribeNewsletter,
} from "@/lib/forms";

interface NewsletterSheetProps {
  children: React.ReactNode;
}

const emailSchema = z
  .string()
  .trim()
  .min(1, "Please enter your email address.")
  .email("That doesn't look like a valid email address.");

const NewsletterSheet = ({ children }: NewsletterSheetProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const resetForm = () => {
    setEmail("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid email.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submission = await subscribeNewsletter({
        email: result.data,
        source: "Newsletter sheet",
      });

      if (!submission.ok) {
        setError(submission.error);
        toast.error("Something went wrong.", {
          description: submission.error,
        });
        return;
      }

      if (submission.mode === "endpoint") {
        toast.success("You're subscribed.", {
          description: "Look for our next issue in your inbox.",
        });
      } else {
        toast.success("Opening your email client…", {
          description: "Send the prefilled message to confirm your signup.",
        });
      }
      resetForm();
      setIsOpen(false);
    } catch {
      toast.error("Something went wrong.", {
        description: "Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = isSubmitting
    ? "Sending…"
    : HAS_NEWSLETTER_ENDPOINT
    ? "Submit"
    : "Send via Email";

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-[100vw] md:w-[50vw] overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="flex-grow flex flex-col justify-center px-4 pb-12 pt-12">
            <div className="w-full max-w-[880px] mx-auto">
              <h2 className="font-display text-[3.6rem] md:text-[4.8rem] font-semibold leading-[1.1] mb-8">
                Newsletter
              </h2>

              <p className="text-[1.6rem] md:text-[1.8rem] text-muted-foreground leading-relaxed mb-12">
                Sign up to receive stories, photography insights, and updates on
                new work delivered directly to your inbox.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <label
                  htmlFor="newsletter-email"
                  className="block text-[1.4rem] font-medium text-foreground mb-3"
                >
                  Email
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="email"
                    id="newsletter-email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={
                      error ? "newsletter-email-error" : undefined
                    }
                    autoComplete="email"
                    inputMode="email"
                    required
                    className="flex-1 px-6 py-4 text-[1.6rem] border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-12 py-4 text-[1.6rem] font-medium bg-foreground text-background hover:bg-primary hover:text-background transition-all duration-300 rounded-lg md:w-auto whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitLabel}
                  </button>
                </div>

                {error && (
                  <p
                    id="newsletter-email-error"
                    role="alert"
                    aria-live="assertive"
                    className="mt-3 text-[1.3rem] text-destructive"
                  >
                    {error}
                  </p>
                )}
              </form>

              {!HAS_NEWSLETTER_ENDPOINT && (
                <p className="text-[1.3rem] text-muted-foreground leading-relaxed mt-4">
                  We'll open your default email client with a prefilled message
                  so we can add you manually.
                </p>
              )}

              <p className="text-[1.3rem] text-muted-foreground leading-relaxed mt-8">
                You may unsubscribe at any time. By submitting information, you
                accept our{" "}
                <Link
                  to="/privacy-policy"
                  className="text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewsletterSheet;
