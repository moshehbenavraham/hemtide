/**
 * Centralized form submission helpers for the publication.
 *
 * Each helper tries a real HTTPS endpoint first (when configured via
 * `VITE_NEWSLETTER_ENDPOINT` / `VITE_CONTACT_FORM_ENDPOINT`), then falls back
 * to opening a prefilled mailto: draft so visitor submissions are never
 * silently dropped. UI components branch on the returned `mode` to phrase
 * confirmation toasts appropriately.
 */
import { CONTACT_EMAIL, SITE_NAME } from "@/config/site";

const NEWSLETTER_ENDPOINT =
  (import.meta.env.VITE_NEWSLETTER_ENDPOINT ?? "").trim();
const CONTACT_FORM_ENDPOINT =
  (import.meta.env.VITE_CONTACT_FORM_ENDPOINT ?? "").trim();

export const HAS_NEWSLETTER_ENDPOINT = NEWSLETTER_ENDPOINT.length > 0;
export const HAS_CONTACT_ENDPOINT = CONTACT_FORM_ENDPOINT.length > 0;

export interface NewsletterPayload {
  email: string;
  /** Free-text label used to differentiate signup surfaces in the mailto: body. */
  source?: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type SubmitResult =
  | { ok: true; mode: "endpoint" | "mailto" }
  | { ok: false; error: string };

const openMailto = (params: {
  to: string;
  subject: string;
  body: string;
}): void => {
  const url = `mailto:${params.to}?subject=${encodeURIComponent(
    params.subject
  )}&body=${encodeURIComponent(params.body)}`;
  if (typeof window !== "undefined") {
    window.location.href = url;
  }
};

const tryEndpoint = async (
  endpoint: string,
  payload: unknown
): Promise<SubmitResult> => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return {
        ok: false,
        error: `Submission failed (${response.status}). Please try again.`,
      };
    }
    return { ok: true, mode: "endpoint" };
  } catch {
    return {
      ok: false,
      error: "Network error — please check your connection and try again.",
    };
  }
};

/**
 * Subscribe a visitor to the newsletter. Tries VITE_NEWSLETTER_ENDPOINT first;
 * otherwise opens a mailto: draft to CONTACT_EMAIL describing the signup.
 */
export const subscribeNewsletter = async (
  payload: NewsletterPayload
): Promise<SubmitResult> => {
  if (HAS_NEWSLETTER_ENDPOINT) {
    return tryEndpoint(NEWSLETTER_ENDPOINT, payload);
  }

  const subject = `[${SITE_NAME}] Newsletter signup`;
  const sourceLine = payload.source ? `Source: ${payload.source}\n` : "";
  const body = `Please add me to the ${SITE_NAME} newsletter.\n\nEmail: ${payload.email}\n${sourceLine}`;
  openMailto({ to: CONTACT_EMAIL, subject, body });
  return { ok: true, mode: "mailto" };
};

/**
 * Send a contact-form message. Tries VITE_CONTACT_FORM_ENDPOINT first;
 * otherwise opens a mailto: draft with the message body pre-filled.
 */
export const sendContactMessage = async (
  payload: ContactPayload
): Promise<SubmitResult> => {
  if (HAS_CONTACT_ENDPOINT) {
    return tryEndpoint(CONTACT_FORM_ENDPOINT, payload);
  }

  const subject = `[${SITE_NAME}] ${payload.subject}`;
  const body = `From: ${payload.name} <${payload.email}>\n\n${payload.message}`;
  openMailto({ to: CONTACT_EMAIL, subject, body });
  return { ok: true, mode: "mailto" };
};
