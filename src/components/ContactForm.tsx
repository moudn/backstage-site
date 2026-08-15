import { useState, type FormEvent } from "react";
import { CONTACT_EMAIL } from "../data/content";

/* There is no backend. The design had submit show "Not wired up yet — email
 * us directly for now", which is honest but leaves someone who has just typed
 * out their problem with nowhere to send it.
 *
 * Until this is wired to a real endpoint, submitting hands the text straight
 * to the visitor's mail client with everything already filled in, so the form
 * keeps the promise it makes. The note below it says plainly what happened.
 *
 * TODO: point this at a real form endpoint or inbox relay, then drop the
 * mailto fallback and give it proper success and error states. */
export function ContactForm() {
  const [note, setNote] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const body = [
      message,
      "",
      name && `— ${name}`,
      email && `Reply to: ${email}`,
    ]
      .filter(Boolean)
      .join("\n");

    const href =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(name ? `What's eating ${name}'s week` : "Backstage enquiry")}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = href;
    setNote(`Opening your email app, addressed to ${CONTACT_EMAIL}.`);
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
        <textarea name="message" rows={4} />
      </label>
      <div className="form__actions">
        <button type="submit" className="btn-pill">
          Start a conversation
        </button>
        <span aria-live="polite" className="form__note">
          {note}
        </span>
      </div>
    </form>
  );
}

export default ContactForm;
