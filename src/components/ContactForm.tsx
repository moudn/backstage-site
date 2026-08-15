/* The contact form, wired to deliver enquiries as email.
 *
 * A static site cannot send email by itself — there is no server to send it
 * from, and no browser will hand out SMTP credentials. Delivery therefore
 * goes through a form-relay service, which receives the POST and forwards it
 * to the Backstage inbox. This is configured with one environment variable:
 *
 *   VITE_FORM_ENDPOINT   the URL to POST to
 *   VITE_FORM_KEY        the access key, if the service uses one
 *
 * It is written against Web3Forms' shape (a JSON POST with an `access_key`,
 * replying `{ success: boolean }`), which needs no account — you give it an
 * address, it emails a key. Formspree and Formspark take the same JSON POST;
 * only the success field differs, which is why the check below treats any 2xx
 * as delivered rather than trusting one provider's payload.
 *
 * With nothing configured, submitting falls back to the visitor's own mail
 * client with the message pre-filled. That is not as good — it loses anyone
 * without a desktop mail client set up — but it never silently swallows an
 * enquiry, which is the one outcome that must not happen.
 */

import { useState, type FormEvent } from "react";
import { CONTACT_EMAIL } from "../data/content";

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;
const ACCESS_KEY = import.meta.env.VITE_FORM_KEY as string | undefined;

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState("");

  function mailtoFallback(name: string, email: string, message: string) {
    const body = [message, "", name && `— ${name}`, email && `Reply to: ${email}`]
      .filter(Boolean)
      .join("\n");
    const href =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(name ? `What's eating ${name}'s week` : "Backstage enquiry")}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!message) {
      setStatus("error");
      setNote("Tell us what's eating your week and we'll take it from there.");
      return;
    }

    if (!ENDPOINT) {
      mailtoFallback(name, email, message);
      setStatus("idle");
      setNote(`Opening your email app, addressed to ${CONTACT_EMAIL}.`);
      return;
    }

    setStatus("sending");
    setNote("Sending…");
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...(ACCESS_KEY ? { access_key: ACCESS_KEY } : null),
          subject: name ? `Backstage enquiry — ${name}` : "Backstage enquiry",
          from_name: name || "Website enquiry",
          name,
          email,
          message,
          // Honeypot: a bot fills every field it finds, a person never sees
          // this one. Relays that understand `botcheck` drop it server-side.
          botcheck: String(data.get("company") ?? ""),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus("sent");
      setNote("Thank you — that's with us. We'll come back to you shortly.");
      form.reset();
    } catch {
      // Never leave someone who has just written out their problem with
      // nowhere to send it: hand them the same text in their mail client.
      setStatus("error");
      setNote(
        `That didn't send — opening your email app instead, addressed to ${CONTACT_EMAIL}.`
      );
      mailtoFallback(name, email, message);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        <span className="form__label">Your name</span>
        <input type="text" name="name" autoComplete="name" />
      </label>
      <label>
        <span className="form__label">Email</span>
        <input type="email" name="email" autoComplete="email" />
      </label>
      <label>
        <span className="form__label">What's eating your week?</span>
        <textarea name="message" rows={4} required />
      </label>

      {/* Honeypot. Hidden from people and from screen readers; bots fill it. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <div className="form__actions">
        <button type="submit" className="btn-pill" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Start a conversation"}
        </button>
        <span aria-live="polite" className="form__note" data-status={status}>
          {note}
        </span>
      </div>
    </form>
  );
}

export default ContactForm;
