/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Optional HTTPS endpoint that accepts POST { email, source? } to subscribe
   * a visitor to the newsletter. When unset, the form falls back to opening a
   * mailto: draft addressed to VITE_CONTACT_EMAIL.
   */
  readonly VITE_NEWSLETTER_ENDPOINT?: string;
  /**
   * Optional HTTPS endpoint that accepts POST { name, email, subject, message }
   * for contact-form submissions. When unset, the form falls back to a mailto:
   * draft addressed to VITE_CONTACT_EMAIL.
   */
  readonly VITE_CONTACT_FORM_ENDPOINT?: string;
  /**
   * Override the publication's primary contact email. Defaults to
   * hello@voyager.press (mirrors the canonical SITE_URL hostname).
   */
  readonly VITE_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
