import { useState, type FormEvent } from "react";
import { api, ApiClientError } from "../api/client.js";
import type { Product } from "../types.js";

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "message", string>>;

export function EnquiryForm({ product }: { product: Product }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const errors: FieldErrors = {};

    if (!name) errors.name = "Enter your name.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!message) errors.message = "Tell us how we can help.";
    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await api.submitEnquiry({
        productId: product.id,
        name,
        email,
        ...(phone ? { phone } : {}),
        message,
      });
      setSubmitted(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We could not send your enquiry. Please try again.",
      );
      if (error instanceof ApiClientError) {
        const serverErrors: FieldErrors = {};
        if (error.fields.name) serverErrors.name = error.fields.name;
        if (error.fields.email) serverErrors.email = error.fields.email;
        if (error.fields.phone) serverErrors.phone = error.fields.phone;
        if (error.fields.message) serverErrors.message = error.fields.message;
        setFieldErrors(serverErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="thank-you" role="status" aria-live="polite">
        <p className="eyebrow">Enquiry received</p>
        <h2>Thank you.</h2>
        <p>
          The sales team has your enquiry about <strong>{product.title}</strong>.
          They can reply directly to the email address you supplied.
        </p>
      </section>
    );
  }

  return (
    <section className="enquiry-panel" aria-labelledby="enquiry-heading">
      <p className="eyebrow">Talk to our team</p>
      <h2 id="enquiry-heading">Enquire about this product</h2>
      <p className="enquiry-panel__intro">
        Leave your details and we’ll help with availability, specifications, or next steps.
      </p>
      {formError && <div className="form-alert" role="alert">{formError}</div>}
      <form className="enquiry-form" noValidate onSubmit={submit}>
        <div className="form-row">
          <label htmlFor="enquiry-name">Name</label>
          <input id="enquiry-name" name="name" autoComplete="name" required maxLength={100} aria-describedby="name-error" />
          {fieldErrors.name && <span id="name-error" className="field-error">{fieldErrors.name}</span>}
        </div>
        <div className="form-row">
          <label htmlFor="enquiry-email">Email</label>
          <input id="enquiry-email" name="email" type="email" autoComplete="email" required aria-describedby="email-error" />
          {fieldErrors.email && <span id="email-error" className="field-error">{fieldErrors.email}</span>}
        </div>
        <div className="form-row">
          <label htmlFor="enquiry-phone">Phone <span>(optional)</span></label>
          <input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" maxLength={30} aria-describedby="phone-error" />
          {fieldErrors.phone && <span id="phone-error" className="field-error">{fieldErrors.phone}</span>}
        </div>
        <div className="form-row">
          <label htmlFor="enquiry-message">Message</label>
          <textarea id="enquiry-message" name="message" required rows={5} maxLength={3000} aria-describedby="message-error" />
          {fieldErrors.message && <span id="message-error" className="field-error">{fieldErrors.message}</span>}
        </div>
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Sending enquiry…" : "Submit enquiry"}
        </button>
      </form>
    </section>
  );
}

