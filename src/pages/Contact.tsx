import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import CenteredContent from "@/components/CenteredContent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import SkipLink from "@/components/SkipLink";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CONTACT_EMAIL,
  PRESS_EMAIL,
  SITE_NAME,
  SITE_PUBLISHER,
  absoluteUrl,
  getActiveSocialLinks,
} from "@/config/site";
import {
  HAS_CONTACT_ENDPOINT,
  sendContactMessage,
} from "@/lib/forms";

const contactSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("That doesn't look like a valid email address."),
  name: z.string().trim().min(2, "Please enter your name (2+ characters)."),
  subject: z
    .string()
    .trim()
    .min(3, "Subject should be at least 3 characters."),
  message: z
    .string()
    .trim()
    .min(10, "Your message should be at least 10 characters."),
});

type ContactFormValues = z.infer<typeof contactSchema>;
type FieldErrors = Partial<Record<keyof ContactFormValues, string>>;

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormValues>({
    email: "",
    name: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: `Contact ${SITE_NAME}`,
      url: absoluteUrl("/contact"),
      mainEntity: {
        "@type": "Organization",
        name: SITE_PUBLISHER,
        email: CONTACT_EMAIL,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Editorial",
          email: CONTACT_EMAIL,
        },
      },
    }),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof ContactFormValues | undefined;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields and try again.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const submission = await sendContactMessage(result.data);

      if (!submission.ok) {
        toast.error("Something went wrong.", {
          description: `${submission.error} You can email us directly at ${CONTACT_EMAIL}.`,
        });
        return;
      }

      if (submission.mode === "endpoint") {
        toast.success("Message sent.", {
          description: "We'll get back to you within a few days.",
        });
      } else {
        toast.success("Opening your email client…", {
          description: `Your message is ready to send to ${CONTACT_EMAIL}.`,
        });
      }
      setFormData({ email: "", name: "", subject: "", message: "" });
    } catch {
      toast.error("Something went wrong.", {
        description: `Please email us directly at ${CONTACT_EMAIL}.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSocials = getActiveSocialLinks();
  const submitLabel = isSubmitting
    ? "Sending…"
    : HAS_CONTACT_ENDPOINT
    ? "Send Now"
    : "Send via Email";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const inputClass = (field: keyof ContactFormValues) =>
    `w-full px-6 py-4 text-[1.6rem] border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
      errors[field] ? "border-destructive" : "border-border"
    }`;

  const renderError = (field: keyof ContactFormValues) =>
    errors[field] ? (
      <p
        id={`${field}-error`}
        role="alert"
        className="mt-2 text-[1.3rem] text-destructive"
      >
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Get in Touch"
        description={`Reach out to ${SITE_PUBLISHER} for editorial inquiries, bookings, press, and creative collaborations.`}
        canonical="/contact"
        jsonLd={jsonLd}
      />
      <SkipLink />
      <Header />

      <main id="main-content" tabIndex={-1} className="flex-grow">
        <CenteredContent className="py-16 md:py-24">
          <article className="prose prose-lg max-w-none">
            <h1 className="font-display text-[4rem] md:text-[6rem] font-semibold leading-[1.1] mb-12">
              Get in Touch
            </h1>

            <div className="mb-16">
              <p className="text-[1.8rem] md:text-[2rem] text-muted-foreground leading-relaxed">
                Have a project in mind? Let's create something beautiful together.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mb-24" noValidate>
              <div className="space-y-8">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[1.4rem] font-medium text-foreground mb-3"
                  >
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    required
                    className={inputClass("email")}
                  />
                  {renderError("email")}
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-[1.4rem] font-medium text-foreground mb-3"
                  >
                    Your Real Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    required
                    className={inputClass("name")}
                  />
                  {renderError("name")}
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-[1.4rem] font-medium text-foreground mb-3"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    aria-invalid={errors.subject ? "true" : "false"}
                    aria-describedby={
                      errors.subject ? "subject-error" : undefined
                    }
                    required
                    className={inputClass("subject")}
                  />
                  {renderError("subject")}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-[1.4rem] font-medium text-foreground mb-3"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    aria-invalid={errors.message ? "true" : "false"}
                    aria-describedby={
                      errors.message ? "message-error" : undefined
                    }
                    required
                    rows={12}
                    className={`${inputClass("message")} resize-y`}
                  />
                  {renderError("message")}
                </div>

                {/* Submit Button */}
                <div className="flex flex-col items-center gap-3 pt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-12 py-4 text-[1.6rem] font-medium bg-foreground text-background hover:bg-primary hover:text-background transition-all duration-300 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitLabel}
                  </button>
                  {!HAS_CONTACT_ENDPOINT && (
                    <p className="text-[1.2rem] text-muted-foreground text-center max-w-[480px]">
                      We'll open your default email client with your message
                      prefilled so you can send it directly to {CONTACT_EMAIL}.
                    </p>
                  )}
                </div>
              </div>
            </form>

            {/* FAQ Section */}
            <div className="text-[1.6rem] leading-relaxed">
              <h2 className="font-display text-[2.4rem] md:text-[3rem] font-semibold mb-8">
                Frequently Asked Questions
              </h2>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-display text-[2rem] md:text-[2.4rem] font-semibold text-left">
                    For Project Inquiries
                  </AccordionTrigger>
                  <AccordionContent className="text-[1.6rem] leading-relaxed">
                    <p className="text-muted-foreground mb-4">
                      I'm always excited to discuss new projects, collaborations,
                      and creative opportunities. Whether you're a brand looking
                      for editorial photography, a magazine planning a shoot, or
                      a creative director with a vision, I'd love to hear from
                      you.
                    </p>
                    <p className="text-foreground">
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="underline underline-offset-4 decoration-2 hover:text-primary transition-colors"
                      >
                        {CONTACT_EMAIL}
                      </a>
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-display text-[2rem] md:text-[2.4rem] font-semibold text-left">
                    Booking Information
                  </AccordionTrigger>
                  <AccordionContent className="text-[1.6rem] leading-relaxed">
                    <p className="text-muted-foreground mb-4">
                      When reaching out, please include:
                    </p>
                    <ul className="list-disc pl-8 space-y-2 text-muted-foreground">
                      <li>Project details and creative vision</li>
                      <li>Desired timeline and shoot dates</li>
                      <li>Budget range</li>
                      <li>Location (studio or on-location)</li>
                      <li>Any reference images or mood boards</li>
                    </ul>
                    <p className="text-muted-foreground mt-4">
                      I'm typically booked 2-3 months in advance, but I always
                      try to accommodate compelling projects with tighter
                      timelines.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-display text-[2rem] md:text-[2.4rem] font-semibold text-left">
                    Press & Features
                  </AccordionTrigger>
                  <AccordionContent className="text-[1.6rem] leading-relaxed">
                    <p className="text-muted-foreground mb-4">
                      For press inquiries, interview requests, or speaking
                      engagements, please contact:
                    </p>
                    <p className="text-foreground">
                      <a
                        href={`mailto:${PRESS_EMAIL}`}
                        className="underline underline-offset-4 decoration-2 hover:text-primary transition-colors"
                      >
                        {PRESS_EMAIL}
                      </a>
                    </p>
                  </AccordionContent>
                </AccordionItem>

                {activeSocials.length > 0 && (
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="font-display text-[2rem] md:text-[2.4rem] font-semibold text-left">
                      Social
                    </AccordionTrigger>
                    <AccordionContent className="text-[1.6rem] leading-relaxed">
                      <p className="text-muted-foreground mb-4">
                        Follow along for behind-the-scenes moments, recent work,
                        and creative inspiration:
                      </p>
                      <div className="flex flex-col gap-2">
                        {activeSocials.map((social) => (
                          <a
                            key={social.platform}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground underline underline-offset-4 decoration-2 hover:text-primary transition-colors"
                          >
                            {social.label}
                          </a>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                <AccordionItem value="item-5">
                  <AccordionTrigger className="font-display text-[2rem] md:text-[2.4rem] font-semibold text-left">
                    Studio Location
                  </AccordionTrigger>
                  <AccordionContent className="text-[1.6rem] leading-relaxed">
                    <p className="text-muted-foreground">
                      Based in Vesterbro, Copenhagen, Denmark
                      <br />
                      Available for projects worldwide
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </article>
        </CenteredContent>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
